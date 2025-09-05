import { saveAs } from "file-saver";

/**
 * Downloads a PDF file from a URL using file-saver
 * @param url - The URL of the PDF file
 * @param filename - The filename for the downloaded file
 */
export async function downloadPdf(url: string, filename: string): Promise<void> {
  try {
    // Fetch the PDF file
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the file as a blob
    const blob = await response.blob();
    
    // Use file-saver to download the file
    saveAs(blob, filename);
  } catch (error) {
    console.error('Download failed:', error);
    
    // Fallback: try to open the file in a new tab
    window.open(url, '_blank');
  }
}
