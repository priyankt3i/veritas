
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Report } from "../types";

/**
 * Generates a full investigative report by calling the server-side API.
 */
export const generateInvestigativeReport = async (
  topic: string,
  onProgress: (status: string) => void
): Promise<Report> => {

  // Simulate progress stages since the server request is a single await
  const progressMessages = [
    "Deploying investigative agents...",
    "Accessing classified archives...",
    "Cross-referencing verified sources...",
    "Detecting financial anomalies...",
    "Structuring investigation dossier...",
    "Visualizing evidence patterns...",
    "Finalizing report for declassification..."
  ];

  let msgIndex = 0;
  onProgress(progressMessages[0]);
  
  const progressInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % progressMessages.length;
    onProgress(progressMessages[msgIndex]);
  }, 3500);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
    }

    const report: Report = await response.json();
    return report;

  } finally {
    clearInterval(progressInterval);
  }
};
