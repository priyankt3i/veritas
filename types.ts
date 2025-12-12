/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface SearchResultItem {
  title: string;
  url: string;
}

export type ReportSectionType = 'text' | 'image' | 'header' | 'subheader';

export interface ReportSection {
  type: ReportSectionType;
  content: string; // Text content or Image URL
  metadata?: string; // Image prompt or caption
}

export interface GeneratedImage {
  id: string;
  data: string;
  prompt: string;
}

export interface Report {
  id: string;
  topic: string;
  title: string;
  sections: ReportSection[];
  sources: SearchResultItem[];
  timestamp: number;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}