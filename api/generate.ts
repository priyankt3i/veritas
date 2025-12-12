import { GoogleGenAI } from "@google/genai";

// Define types locally to ensure self-containment for the serverless build
interface SearchResultItem {
  title: string;
  url: string;
}

interface ReportSection {
  type: 'text' | 'image' | 'header' | 'subheader';
  content: string;
  metadata?: string;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic } = JSON.parse(request.body);

  if (!process.env.API_KEY) {
    return response.status(500).json({ error: 'Server API_KEY not configured' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const TEXT_MODEL = 'gemini-2.5-flash';
  const IMAGE_MODEL = 'gemini-2.5-flash-image';

  try {
    // 1. Research and Drafting
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

    const textResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: systemPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
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
    const uniqueSources = Array.from(new Map(sources.map(item => [item.url, item])).values());

    // 2. Parse Content
    const lines = rawText.split('\n');
    const sections: ReportSection[] = [];
    let currentTitle = "Untitled Report";

    const titleMatch = rawText.match(/^#\s*(.+)$/m);
    if (titleMatch) currentTitle = titleMatch[1];

    let bufferText = "";
    const flushBuffer = () => {
      if (bufferText.trim()) {
        sections.push({ type: 'text', content: bufferText.trim() });
        bufferText = "";
      }
    };

    const imageGenerationTasks: { index: number, prompt: string }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      const normalizedLine = trimmedLine.replace(/^[\s*\[\]]+/, '').toUpperCase();

      if (line.startsWith('# ')) {
        continue;
      } else if (line.startsWith('## ')) {
        flushBuffer();
        sections.push({ type: 'header', content: line.replace(/^##\s+/, '').replace(/\*\*/g, '').trim() });
      } else if (line.startsWith('### ')) {
        flushBuffer();
        sections.push({ type: 'subheader', content: line.replace(/^###\s+/, '').replace(/\*\*/g, '').trim() });
      } else if (normalizedLine.startsWith('VISUAL_PROMPT')) {
        flushBuffer();
        let prompt = trimmedLine.replace(/^.*?VISUAL_PROMPT.*?:/i, '').trim();
        prompt = prompt.replace(/[\]*]+$/, '').trim();
        
        const placeholderIndex = sections.length;
        sections.push({ type: 'image', content: 'loading', metadata: prompt });
        imageGenerationTasks.push({ index: placeholderIndex, prompt });
      } else {
        bufferText += line + "\n";
      }
    }
    flushBuffer();

    // 3. Generate Visuals (Server Side)
    if (imageGenerationTasks.length > 0) {
      const tasks = imageGenerationTasks.map(async (task) => {
        try {
          const enhancedPrompt = `
            Create a high-quality editorial infographic or data visualization. 
            Subject: ${task.prompt}.
            Style: Professional investigative journalism, New York Times or Economist style. 
            Clean vector lines, mature color palette (dark slate, mute gold, alert red). 
            No cartoony elements. Highly detailed and legible.
            Aspect Ratio: 16:9.
          `;

          const imageResponse = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: enhancedPrompt }] },
          });
          
          let imageBase64 = null;
          if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }
          
          return { index: task.index, data: imageBase64 };
        } catch (e) {
          console.error("Failed to generate chart", e);
          return { index: task.index, data: null };
        }
      });

      const results = await Promise.all(tasks);

      results.forEach(res => {
          if (res.data) {
              sections[res.index].content = res.data;
          } else {
              sections[res.index].content = `[Visual Data Unavailable: ${sections[res.index].metadata}]`;
          }
      });
    }

    return response.status(200).json({
      id: Date.now().toString(),
      topic,
      title: currentTitle,
      sections,
      sources: uniqueSources,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('API Error:', error);
    return response.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}