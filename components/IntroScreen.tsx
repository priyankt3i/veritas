/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Newspaper, Search, FileText } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 1000); 
    const timer2 = setTimeout(() => setPhase(2), 2500); 
    const timer3 = setTimeout(() => setPhase(3), 4000); 

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-display">
      {/* Noir Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black"></div>
      
      {/* Grainy Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative w-full max-w-lg flex flex-col items-center justify-center p-8">
        
        {/* Phase 1: Typewriter Effect / Headline */}
        <div className={`transition-all duration-1000 transform ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl md:text-7xl font-headline font-bold text-white tracking-tighter mb-2 text-center">
                VERITAS
            </h1>
        </div>

        {/* Phase 2: The Red Line */}
        <div className={`h-1 bg-red-600 transition-all duration-1000 ease-out ${phase >= 2 ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>

        {/* Phase 3: Subtitle and Button */}
        <div className={`mt-8 flex flex-col items-center gap-6 transition-all duration-1000 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-zinc-400 font-serif italic text-lg text-center">
                "In a world of noise, data is the only truth."
            </p>
            
            <button 
                onClick={onComplete}
                className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm hover:bg-red-600 hover:text-white transition-colors duration-300"
            >
                Start Investigation
            </button>
        </div>

      </div>
    </div>
  );
};

export default IntroScreen;