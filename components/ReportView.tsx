
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Report, ReportSection } from '../types';
import { Share2, Printer, ExternalLink, Quote, AlertTriangle, Copy } from 'lucide-react';

interface ReportViewProps {
  report: Report;
}

// Helper to render text with basic Markdown formatting (Bold, Italic)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Split by bold (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-50">{content}</strong>;
        } else {
            // Check for italics in the non-bold parts
            const italicParts = part.split(/(\*.*?\*)/g);
            return (
                <span key={i}>
                    {italicParts.map((subPart, j) => {
                        if (subPart.startsWith('*') && subPart.endsWith('*')) {
                            return <em key={j} className="italic text-zinc-800 dark:text-zinc-300">{subPart.slice(1, -1)}</em>;
                        }
                        return subPart;
                    })}
                </span>
            );
        }
      })}
    </span>
  );
};

const ReportView: React.FC<ReportViewProps> = ({ report }) => {

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
        title: report.title,
        text: `Investigative Report: ${report.title}\n\nUncovered by Veritas AI.`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
            alert('Report summary copied to clipboard.');
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
  };

  return (
    <article className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 print:max-w-none print:w-full">
      
      {/* Report Header */}
      <header className="mb-12 text-center border-b-2 border-zinc-900 dark:border-zinc-100 pb-8 print:border-black">
        <div className="flex justify-center items-center gap-2 mb-6">
            <span className="h-px w-12 bg-zinc-400 print:bg-black"></span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 print:text-black">Investigative Report</span>
            <span className="h-px w-12 bg-zinc-400 print:bg-black"></span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight print:text-black">
            {report.title}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-500 print:text-black">
            <span>By Veritas AI</span>
            <span>•</span>
            <span>{new Date(report.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="print:hidden">•</span>
            <div className="flex gap-3 print:hidden">
                <button onClick={handlePrint} className="hover:text-red-600 transition-colors" title="Print Report">
                    <Printer className="w-4 h-4" />
                </button>
                <button onClick={handleShare} className="hover:text-red-600 transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </div>
      </header>

      {/* Report Body */}
      <div className="space-y-8 font-article text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 print:text-black">
        {report.sections.map((section, idx) => {
            if (section.type === 'header') {
                return (
                    <h2 key={idx} className="text-2xl md:text-3xl font-headline font-bold text-zinc-900 dark:text-zinc-100 mt-12 mb-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 print:text-black print:border-black">
                        {section.content}
                    </h2>
                );
            }

            if (section.type === 'subheader') {
                return (
                    <h3 key={idx} className="text-xl font-headline font-bold text-zinc-800 dark:text-zinc-200 mt-8 mb-4 print:text-black">
                        {section.content}
                    </h3>
                );
            }
            
            if (section.type === 'image') {
                if (section.content === 'loading') {
                    return (
                        <div key={idx} className="my-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-64 flex flex-col items-center justify-center text-zinc-400 gap-2 rounded-sm print:hidden">
                            <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs uppercase tracking-widest font-sans">Generating Evidence...</span>
                        </div>
                    );
                }
                // Handle text-only fallback (error case)
                if (section.content.startsWith('[Visual Data Unavailable')) {
                     return (
                        <div key={idx} className="my-8 p-4 bg-zinc-50 dark:bg-zinc-900 border-l-4 border-zinc-300 dark:border-zinc-700 flex gap-3 print:border-black">
                            <AlertTriangle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                            <p className="text-sm text-zinc-500 italic font-sans">{section.content}</p>
                        </div>
                     );
                }

                return (
                    <figure key={idx} className="my-10 break-inside-avoid">
                        <div className="relative border-4 border-zinc-900 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-1 shadow-2xl print:border-black print:shadow-none">
                             <img src={section.content} alt="Data Visualization" className="w-full h-auto block" />
                             {/* Watermark */}
                             <div className="absolute top-4 right-4 text-[10px] font-bold text-white/50 uppercase tracking-widest pointer-events-none print:text-black/50">
                                Veritas Data
                             </div>
                        </div>
                        <figcaption className="mt-3 flex gap-2 text-sm text-zinc-500 font-sans border-l-2 border-red-600 pl-3 print:text-black print:border-black">
                            <span className="font-bold text-red-600 uppercase text-xs tracking-wider pt-0.5 print:text-black">Fig {idx + 1}.</span>
                            <span className="italic">{section.metadata}</span>
                        </figcaption>
                    </figure>
                );
            }

            // Detect Executive Summary (usually first text block)
            if (section.type === 'text' && idx === 0) {
                 return (
                    <div key={idx} className="text-xl md:text-2xl font-serif leading-relaxed text-zinc-900 dark:text-zinc-100 font-medium border-b-4 border-double border-zinc-200 dark:border-zinc-800 pb-8 mb-8 first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-red-700 print:text-black print:border-black print:first-letter:text-black">
                        <FormattedText text={section.content} />
                    </div>
                );
            }

            // Standard Paragraph
            return (
                <p key={idx} className="mb-6 whitespace-pre-wrap text-justify print:text-black">
                    <FormattedText text={section.content} />
                </p>
            );
        })}
      </div>

      {/* Sources Footer */}
      <footer className="mt-16 pt-8 border-t border-zinc-300 dark:border-zinc-700 print:border-black break-inside-avoid">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2 print:text-black">
            <Quote className="w-4 h-4" />
            Sources & References
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.sources.map((source, idx) => (
                <a 
                    key={idx} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-sm group transition-colors print:border print:border-black"
                >
                    <span className="text-zinc-400 font-mono text-xs mt-0.5 print:text-black">[{idx + 1}]</span>
                    <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight group-hover:text-red-600 transition-colors print:text-black">
                            {source.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 font-mono print:text-black">
                            <ExternalLink className="w-3 h-3 print:hidden" />
                            <span className="truncate max-w-[200px]">{new URL(source.url).hostname}</span>
                        </div>
                    </div>
                </a>
            ))}
        </div>

        <div className="mt-12 text-center text-zinc-400 text-xs font-sans uppercase tracking-widest print:text-black">
            Generated by InfoGenius Veritas Engine • Confidential Report
        </div>
      </footer>
    </article>
  );
};

export default ReportView;
