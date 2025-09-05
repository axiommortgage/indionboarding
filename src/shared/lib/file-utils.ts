/**
 * File utility functions for handling file extensions and types
 */

export interface FileInfo {
  ext?: string;
  url?: string;
  name?: string;
  mime?: string;
}

/**
 * Extracts the file extension from a file object, prioritizing the ext property
 * and falling back to URL parsing if needed. Handles nested extensions properly.
 */
export function getFileExtension(file: FileInfo): string {
  // First priority: use the ext property if available (most reliable)
  if (file.ext) {
    const cleanExt = file.ext.replace(/^\./, '').toLowerCase();
    // Handle cases where ext might contain multiple dots (e.g., ".docx.pdf")
    if (cleanExt.includes('.')) {
      // Take the last extension as it's usually the actual file type
      const parts = cleanExt.split('.');
      return parts[parts.length - 1];
    }
    return cleanExt;
  }

  // Second priority: extract from URL (check for query params that might interfere)
  if (file.url) {
    try {
      const url = new URL(file.url);
      const pathname = url.pathname;
      const urlParts = pathname.split('.');
      if (urlParts.length > 1) {
        const lastPart = urlParts[urlParts.length - 1].toLowerCase();
        // Remove any query parameters or fragments from the extension
        const cleanExt = lastPart.split('?')[0].split('#')[0];
        if (cleanExt && cleanExt.length <= 5) { // Reasonable extension length
          return cleanExt;
        }
      }
    } catch (error) {
      // If URL parsing fails, fall back to string splitting
      const urlParts = file.url.split('.');
      if (urlParts.length > 1) {
        const lastPart = urlParts[urlParts.length - 1].toLowerCase();
        const cleanExt = lastPart.split('?')[0].split('#')[0];
        if (cleanExt && cleanExt.length <= 5) {
          return cleanExt;
        }
      }
    }
  }

  // Third priority: extract from filename
  if (file.name) {
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      const lastPart = nameParts[nameParts.length - 1].toLowerCase();
      const cleanExt = lastPart.split('?')[0].split('#')[0];
      if (cleanExt && cleanExt.length <= 5) {
        return cleanExt;
      }
    }
  }

  // Fourth priority: guess from MIME type
  if (file.mime) {
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.ms-powerpoint': 'ppt',
      'text/plain': 'txt',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };
    
    return mimeToExt[file.mime] || '';
  }

  return '';
}

/**
 * Gets the file extension with a leading dot for display purposes
 */
export function getFileExtensionWithDot(file: FileInfo): string {
  const ext = getFileExtension(file);
  return ext ? `.${ext}` : '';
}

/**
 * Determines if a file should use DocViewer based on its extension
 */
export function shouldUseDocViewer(file: FileInfo): boolean {
  const ext = getFileExtension(file);
  const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  return officeExtensions.includes(ext.toLowerCase());
}

/**
 * Determines if a file can be displayed inline
 */
export function canDisplayInline(file: FileInfo): boolean {
  const ext = getFileExtension(file);
  const supportedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  return supportedExtensions.includes(ext.toLowerCase());
}

/**
 * Gets a user-friendly file type label and badge variant
 */
export function getFileTypeBadge(file: FileInfo): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ext = getFileExtension(file);
  
  switch (ext.toLowerCase()) {
    case 'pdf':
      return { label: 'PDF', variant: 'outline' };
    case 'doc':
    case 'docx':
      return { label: 'Word', variant: 'outline' };
    case 'xls':
    case 'xlsx':
      return { label: 'Excel', variant: 'outline' };
    case 'ppt':
    case 'pptx':
      return { label: 'PowerPoint', variant: 'outline' };
    case 'txt':
      return { label: 'Text', variant: 'outline' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return { label: 'Image', variant: 'outline' };
    default:
      return { label: ext.toUpperCase() || 'Document', variant: 'outline' };
  }
}

/**
 * Validates if the detected file extension is consistent across all sources
 */
export function validateFileExtension(file: FileInfo): { isValid: boolean; detectedExt: string; warnings: string[] } {
  const warnings: string[] = [];
  const detectedExt = getFileExtension(file);
  
  if (!detectedExt) {
    return { isValid: false, detectedExt: '', warnings: ['No file extension could be detected'] };
  }

  // Check for inconsistencies between different sources
  if (file.ext && file.ext.replace(/^\./, '').toLowerCase() !== detectedExt) {
    warnings.push(`File extension mismatch: declared as "${file.ext}" but detected as "${detectedExt}"`);
  }

  if (file.url) {
    const urlExt = file.url.split('.').pop()?.split('?')[0]?.split('#')[0]?.toLowerCase();
    if (urlExt && urlExt !== detectedExt && urlExt.length <= 5) {
      warnings.push(`URL extension "${urlExt}" differs from detected extension "${detectedExt}"`);
    }
  }

  if (file.name) {
    const nameExt = file.name.split('.').pop()?.toLowerCase();
    if (nameExt && nameExt !== detectedExt && nameExt.length <= 5) {
      warnings.push(`Filename extension "${nameExt}" differs from detected extension "${detectedExt}"`);
    }
  }

  return { 
    isValid: warnings.length === 0, 
    detectedExt, 
    warnings 
  };
}
