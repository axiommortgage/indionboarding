/**
 * Environment utilities for determining production vs development mode
 * and generating appropriate URLs for assets and APIs
 */

/**
 * Check if we're running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  if (isProduction()) {
    return 'https://indicentral.ca';
  }
  
  // In development, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering in development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get the API base URL for the current environment
 */
export function getApiUrl(): string {
  if (isProduction()) {
    return 'https://api.indicentral.ca'; // Adjust this to your production API URL
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
}

/**
 * Get asset URLs based on environment
 */
export function getAssetUrl(path: string): string {
  const baseUrl = getBaseUrl();
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Get PDF template base path based on environment
 */
export function getPdfTemplateBasePath(): string {
  const baseUrl = getBaseUrl();
  
  if (isProduction()) {
    return `${baseUrl}/listing-models/full/2024`;
  }
  
  return `${baseUrl}/listing-sheet`;
}

/**
 * Get default image paths based on environment
 */
export function getDefaultImagePaths() {
  const baseUrl = getBaseUrl();
  
  if (isProduction()) {
    return {
      realtorDefault: `${baseUrl}/listing-models/full/2024/realtor-image-default.jpg`,
      propertyDefault: `${baseUrl}/listing-models/full/2024/property-image-default.jpg`,
    };
  }
  
  return {
    realtorDefault: `${baseUrl}/listing-sheet/realtor-image-default.jpg`,
    propertyDefault: `${baseUrl}/listing-sheet/property-image-default.jpg`,
  };
}
