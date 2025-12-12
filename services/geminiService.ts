
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";
import { Report, ReportSection, SearchResultItem } from "../types";

const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Switching to gemini-2.5-flash for text to ensure broader compatibility and speed
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

/**
 * Generates a full investigative report.
 * 1. Researches using Google Search.
 * 2. Writes an exposé style article with placeholders for images.
 * 3. Parses the article and generates the images.
 */
export const generateInvestigativeReport = async (
  topic: string,
  onProgress: (status: string) => void
): Promise<Report> => {

  // 1. Research and Drafting
  onProgress("Deploying investigative agents...");
  
  const systemPrompt = `
    You are an award-winning investigative journalist known for "The Veritas Report".
    
    Your Task: Conduct a deep-dive investigation into: "${topic}".
    
    Style Guide:
    - **Unapologetic & Conclusive**: Do not hedge. Use definitive language based on facts.
    - **Connect the Dots**: Look for patterns, financial trails, hypocrisy, or root causes. Put 2 and 2 together.
    - **Hard-Hitting**: This is an exposé, not a Wikipedia summary.
    - **Data-Driven**: Use the search tool to find concrete statistics and evidence.
    - **Formatting**: Use Markdown for emphasis (bold **text**, italic *text*). Use headers (## and ###) to structure the report.
    
    Output Format:
    Structure your response EXACTLY as follows using these tags:
    
    # [Catchy, Hard-Hitting Headline]
    
    [Executive Summary: A powerful bold introductory paragraph summarizing the findings.]
    
    ## [Section Header]
    [Paragraphs of deep analysis. Use **bold** for key facts.]
    
    [VISUAL_PROMPT: Detailed description of a chart, graph, or infographic that visualizes the data mentioned above. Style: High-end editorial data visualization, clean, authoritative, dark mode friendly.]
    
    ## [Next Section Header]
    [More analysis...]
    
    [VISUAL_PROMPT: Another visual description...]
    
    ## Conclusion
    [Final verdict.]
    
    Grounding:
    You MUST use the Google Search tool to gather real-time facts. 
  `;

  onProgress("Cross-referencing sources...");
  
  const textResponse = await getAi().models.generateContent({
    model: TEXT_MODEL,
    contents: systemPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual/focused output
      }
    },
  });

  const rawText = textResponse.text || "Investigation failed to return data.";
  
  // Extract Sources
  const sources: SearchResultItem[] = [];
  const chunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          url: chunk.web.uri
        });
      }
    });
  }
  // Deduplicate sources
  const uniqueSources = Array.from(new Map(sources.map(item => [item.url, item])).values());

  // 2. Parse Content and Identify Visuals
  onProgress("Analyzing data patterns...");
  
  const lines = rawText.split('\n');
  const sections: ReportSection[] = [];
  let currentTitle = "Untitled Report";

  // Quick pass to find title
  const titleMatch = rawText.match(/^#\s*(.+)$/m);
  if (titleMatch) currentTitle = titleMatch[1];

  let bufferText = "";

  const flushBuffer = () => {
    if (bufferText.trim()) {
      sections.push({ type: 'text', content: bufferText.trim() });
      bufferText = "";
    }
  };

  // We will collect image generation promises
  const imageGenerationTasks: { index: number, prompt: string }[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Normalize line to check for visual prompt keyword, stripping markdown bold/italics/brackets from start
    const normalizedLine = trimmedLine.replace(/^[\s*\[\]]+/, '').toUpperCase();

    if (line.startsWith('# ')) {
      // Main title - skip, handled separately
      continue;
    } else if (line.startsWith('## ')) {
      flushBuffer();
      // Remove '## ' and any surrounding markdown that might sneak in
      sections.push({ type: 'header', content: line.replace(/^##\s+/, '').replace(/\*\*/g, '').trim() });
    } else if (line.startsWith('### ')) {
      flushBuffer();
      sections.push({ type: 'subheader', content: line.replace(/^###\s+/, '').replace(/\*\*/g, '').trim() });
    } else if (normalizedLine.startsWith('VISUAL_PROMPT')) {
      flushBuffer();
      // Robust extraction: Remove everything up to the first colon after VISUAL_PROMPT
      // This handles: "[VISUAL_PROMPT:", "**VISUAL_PROMPT:**", "VISUAL_PROMPT:"
      let prompt = trimmedLine.replace(/^.*?VISUAL_PROMPT.*?:/i, '').trim();
      // Clean trailing brackets or markdown
      prompt = prompt.replace(/[\]*]+$/, '').trim();
      
      // Add a placeholder section
      const placeholderIndex = sections.length;
      sections.push({ type: 'image', content: 'loading', metadata: prompt });
      imageGenerationTasks.push({ index: placeholderIndex, prompt });
    } else {
      bufferText += line + "\n";
    }
  }
  flushBuffer();

  // 3. Generate Visuals
  if (imageGenerationTasks.length > 0) {
    onProgress(`Visualizing evidence (${imageGenerationTasks.length} charts)...`);
    
    // Process visuals (limited to 3 to save time/resources, though the model might generate more)
    
    const tasks = imageGenerationTasks.map(async (task) => {
      try {
        const imageBase64 = await generateEditorialImage(task.prompt);
        return { index: task.index, data: imageBase64 };
      } catch (e) {
        console.error("Failed to generate chart", e);
        return { index: task.index, data: null };
      }
    });

    const results = await Promise.all(tasks);

    // Update sections with generated images
    results.forEach(res => {
        if (res.data) {
            sections[res.index].content = res.data;
        } else {
            // If generation failed, remove the image section or convert to text caption
            // The ReportView handles specific error string for fallback UI
            sections[res.index].content = `[Visual Data Unavailable: ${sections[res.index].metadata}]`;
        }
    });
  }

  return {
    id: Date.now().toString(),
    topic,
    title: currentTitle,
    sections,
    sources: uniqueSources,
    timestamp: Date.now()
  };
};

const generateEditorialImage = async (prompt: string): Promise<string> => {
  // Enforce specific style in the prompt
  const enhancedPrompt = `
    Create a high-quality editorial infographic or data visualization. 
    Subject: ${prompt}.
    Style: Professional investigative journalism, New York Times or Economist style. 
    Clean vector lines, mature color palette (dark slate, mute gold, alert red). 
    No cartoony elements. Highly detailed and legible.
    Aspect Ratio: 16:9.
  `;

  const response = await getAi().models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
  });

  // Iterate to find the image part
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
  }
  
  throw new Error("Failed to generate image");
};
