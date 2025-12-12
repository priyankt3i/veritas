
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Report } from './types';
import { generateInvestigativeReport } from './services/geminiService';
import ReportView from './components/ReportView';
import Loading from './components/Loading';
import IntroScreen from './components/IntroScreen';
import { Search, AlertCircle, PenTool, Archive } from 'lucide-react';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [topic, setTopic] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reportHistory, setReportHistory] = useState<Report[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!topic.trim()) {
        setError("Please enter a subject to investigate.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentReport(null);
    setLoadingMessage(`Initiating investigation into "${topic}"...`);

    try {
      const report = await generateInvestigativeReport(topic, (msg) => setLoadingMessage(msg));
      setCurrentReport(report);
      setReportHistory([report, ...reportHistory]);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("404") || err.message.includes("403"))) {
          setError("Access denied. The server configuration might be invalid or the API key is missing permissions.");
      } else {
          setError('The investigation could not be completed. The connection was severed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = (report: Report) => {
    setCurrentReport(report);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    {showIntro ? (
      <IntroScreen onComplete={() => setShowIntro(false)} />
    ) : (
    <div className="min-h-screen bg-[#Fdfbf7] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-red-200 dark:selection:bg-red-900 selection:text-red-900 dark:selection:text-red-100 pb-20 transition-colors">
      
      {/* Header */}
      <header className="border-b-4 border-zinc-900 dark:border-zinc-800 sticky top-0 z-50 bg-[#Fdfbf7]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm transition-colors print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
                V
            </div>
            <div className="flex flex-col">
                <span className="font-headline font-bold text-xl md:text-3xl tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                VERITAS <span className="text-red-700">REPORT</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 font-bold mt-1">Autonomous Investigative AI</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {isDarkMode ? "Light Edition" : "Dark Edition"}
              </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 md:py-12 relative z-10">
        
        {/* Search Input Section */}
        <div className={`max-w-3xl mx-auto transition-all duration-500 print:hidden ${currentReport ? 'mb-12' : 'min-h-[40vh] flex flex-col justify-center'}`}>
          
          {!currentReport && (
            <div className="text-center mb-12 space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Uncover the <span className="italic text-red-700">Truth.</span>
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-serif leading-relaxed">
                Connect the dots. Follow the money. Our AI acts as a relentless investigative journalist to generate data-driven exposés.
              </p>
            </div>
          )}

          <form onSubmit={handleGenerate} className={`relative z-20 transition-all duration-300 ${isLoading ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <div className="relative group">
                <div className="relative bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-1 rounded-sm shadow-xl focus-within:border-red-700 dark:focus-within:border-red-700 transition-colors">
                    <div className="flex items-center">
                        <div className="pl-4 md:pl-6">
                            <Search className="w-6 h-6 text-zinc-400" />
                        </div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter subject for investigation..."
                            className="w-full pl-4 pr-4 py-4 md:py-5 bg-transparent border-none outline-none text-lg md:text-xl font-serif text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:italic"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-6 md:px-8 py-4 m-1 rounded-sm font-bold uppercase tracking-widest hover:bg-red-700 dark:hover:bg-red-700 hover:text-white dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                        >
                            <span>Investigate</span>
                            <PenTool className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Decorative lines */}
                <div className="absolute -bottom-2 left-4 right-4 h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="absolute -bottom-1 left-8 right-8 h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && <Loading message={loadingMessage} />}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 flex items-start gap-4 animate-in fade-in">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
            <div className="flex-1">
                <h3 className="font-bold text-red-900 dark:text-red-100 uppercase tracking-wide text-sm mb-1">Investigation Halted</h3>
                <p className="text-red-800 dark:text-red-200 font-serif text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Report View */}
        {currentReport && !isLoading && (
            <ReportView report={currentReport} />
        )}

        {/* History / Archives */}
        {reportHistory.length > 0 && !isLoading && (
            <div className="max-w-5xl mx-auto mt-24 border-t-2 border-zinc-200 dark:border-zinc-800 pt-12 print:hidden">
                <div className="flex items-center gap-2 mb-8">
                    <Archive className="w-5 h-5 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Case Files
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportHistory.map((rep) => (
                        <div 
                            key={rep.id} 
                            onClick={() => loadHistory(rep)}
                            className={`group cursor-pointer border p-6 bg-white dark:bg-zinc-900 transition-all hover:shadow-xl ${currentReport?.id === rep.id ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-2 py-1">
                                    Confidential
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                    {new Date(rep.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="font-headline font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight mb-2 group-hover:underline decoration-red-600 decoration-2 underline-offset-2">
                                {rep.title || rep.topic}
                            </h4>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                Subject: {rep.topic}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
    )}
    </>
  );
};

export default App;
