/**
 * S3 Proxy utility for handling CORS-restricted external image fetches
 *
 * This utility routes external image requests through our internal API proxy
 * to bypass CORS restrictions when generating PDFs or other client-side operations
 * that need to fetch images from external sources like S3.
 */

import { saveAs } from 'file-saver';

export interface ProxyOptions {
  fallbackUrl?: string;
  mode?: 'stream' | 'check';
}

export interface ProxyResult {
  arrayBuffer: ArrayBuffer;
}

/**
 * Determines if a URL should be proxied based on whether it's external
 */
export function shouldProxyUrl(url: string): boolean {
  // Check if this is an external URL that needs proxying
  return url.includes('amazonaws.com') || 
         url.includes('s3.') || 
         (!url.startsWith('/') && !url.startsWith(window.location.origin));
}

/**
 * Converts a direct URL to a proxied URL
 */
export function getProxyUrl(url: string, mode: 'stream' | 'check' = 'stream'): string {
  const params = new URLSearchParams({
    url: url,
    mode: mode
  });
  return `/api/s3proxy?${params.toString()}`;
}

/**
 * Fetches an image through the S3 proxy if needed, or directly if it's a local URL
 */
export async function fetchImageWithProxy(url: string, options?: ProxyOptions): Promise<ProxyResult> {
  try {
    const needsProxy = shouldProxyUrl(url);
    const fetchUrl = needsProxy ? getProxyUrl(url, options?.mode) : url;

    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      if (options?.fallbackUrl) {
        const fallbackNeedsProxy = shouldProxyUrl(options.fallbackUrl);
        const fallbackFetchUrl = fallbackNeedsProxy ? 
          getProxyUrl(options.fallbackUrl, options?.mode) : 
          options.fallbackUrl;
        
        const fallbackResponse = await fetch(fallbackFetchUrl);
        return { arrayBuffer: await fallbackResponse.arrayBuffer() };
      }
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    return { arrayBuffer: await response.arrayBuffer() };
  } catch (error) {
    if (options?.fallbackUrl) {
      const fallbackNeedsProxy = shouldProxyUrl(options.fallbackUrl);
      const fallbackFetchUrl = fallbackNeedsProxy ? 
        getProxyUrl(options.fallbackUrl, options?.mode) : 
        options.fallbackUrl;
      
      const fallbackResponse = await fetch(fallbackFetchUrl);
      return { arrayBuffer: await fallbackResponse.arrayBuffer() };
    }
    throw error;
  }
}

/**
 * Checks if an image URL is accessible (HEAD request)
 */
export async function checkImageAvailability(url: string): Promise<boolean> {
  try {
    const needsProxy = shouldProxyUrl(url);
    const fetchUrl = needsProxy ? getProxyUrl(url, 'check') : url;

    const response = await fetch(fetchUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image availability check failed:', error);
    return false;
  }
}

/**
 * Downloads a file through the S3 proxy if needed, handling CORS issues
 */
export async function s3ProxyDownload(url: string, filename: string): Promise<void> {
  try {
    const needsProxy = shouldProxyUrl(url);
    const fetchUrl = needsProxy ? getProxyUrl(url, 'stream') : url;

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // Use file-saver to download the file
    saveAs(blob, filename);
  } catch (error) {
    console.error('S3 proxy download failed:', error);
    throw error;
  }
}
