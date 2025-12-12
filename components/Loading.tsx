/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Search, FileSearch, Network, Database } from 'lucide-react';

interface LoadingProps {
  message: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-20 min-h-[400px]">
      
      {/* Radar / Scanner Animation */}
      <div className="relative w-32 h-32 mb-12">
        {/* Static rings */}
        <div className="absolute inset-0 border-2 border-zinc-200 dark:border-zinc-800 rounded-full"></div>
        <div className="absolute inset-8 border border-zinc-200 dark:border-zinc-800 rounded-full"></div>
        
        {/* Scanning Radar */}
        <div className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite] origin-center">
            <div className="w-full h-1/2 bg-gradient-to-t from-transparent to-red-600/20 border-r border-red-600/50"></div>
        </div>
        
        {/* Blips */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse delay-700"></div>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
        </div>
      </div>

      <div className="max-w-md text-center space-y-4">
        <h3 className="text-xl font-headline font-bold text-zinc-900 dark:text-zinc-100 animate-pulse">
            {message}
        </h3>
        
        <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest text-zinc-400 font-mono mt-8">
            <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4" />
                <span>Gathering Intel</span>
            </div>
            <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>Linking Entities</span>
            </div>
            <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Verifying Facts</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Loading;