import heicConvert from 'heic-convert'

/**
 * Checks if the given ArrayBuffer is likely to be a HEIC image.
 *
 * @param {ArrayBuffer} arrayBuffer - The buffer to check.
 * @returns {boolean} - True if the buffer is likely a HEIC image, false otherwise.
 */
function isLikelyHEIC(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer)
  const heicSignature = [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63] // "ftypheic"

  for (let i = 4; i < uint8Array.length - 8; i++) {
    if (heicSignature.every((value, index) => uint8Array[i + index] === value)) {
      return true
    }
  }
  return false
}

/**
 * Converts HEIC image data to JPEG format.
 *
 * @param {ArrayBuffer} arrayBuffer - The HEIC image data.
 * @returns {Promise<{ arrayBuffer: ArrayBuffer, contentType: string }>} - A promise that resolves to the converted JPEG data and its content type.
 */
async function convertHeicToJpeg(arrayBuffer) {
  try {
    if (!isLikelyHEIC(arrayBuffer)) {
      console.warn('File does not appear to be a valid HEIC image. Skipping conversion.')
      return { arrayBuffer, contentType: 'image/jpeg' } // Assume JPEG as fallback
    }

    const jpegBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer),
      format: 'JPEG',
      quality: 0.9
    })
    return { arrayBuffer: jpegBuffer.buffer, contentType: 'image/jpeg' }
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error)
    // Return the original buffer if conversion fails
    return { arrayBuffer, contentType: 'image/jpeg' }
  }
}

/**
 * Fetches a file from a URL with retry mechanism and returns it as an ArrayBuffer.
 *
 * @param {string} url - The URL of the file to fetch.
 * @param {Object} options - Additional options for the fetch operation.
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3).
 * @param {number} options.retryDelay - Delay between retries in milliseconds (default: 1000).
 * @param {string} options.fallbackUrl - Fallback URL to use if the main URL fails (optional).
 * @returns {Promise<{ arrayBuffer: ArrayBuffer, contentType: string }>} - A promise that resolves to the file data as an ArrayBuffer and its content type.
 */
export async function fetchImage(url, options = {}) {
  const { maxRetries = 3, retryDelay = 1000, fallbackUrl = null } = options

  const fetchWithRetry = async (attemptUrl) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const proxyUrl = `/api/s3proxy?url=${encodeURIComponent(attemptUrl)}`
        const response = await fetch(proxyUrl)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        let contentType = response.headers.get('content-type')
        let arrayBuffer = await response.arrayBuffer()

        // Handle HEIC conversion only for image files
        if (
          (contentType.includes('image') || !contentType.includes('pdf')) &&
          (contentType.includes('heic') || attemptUrl.toLowerCase().endsWith('.heic'))
        ) {
          return await convertHeicToJpeg(arrayBuffer)
        }

        return { arrayBuffer, contentType }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed to fetch: ${attemptUrl}`, error)
        if (attempt === maxRetries - 1) {
          if (fallbackUrl && attemptUrl !== fallbackUrl) {
            console.log(`Attempting to fetch fallback: ${fallbackUrl}`)
            return fetchWithRetry(fallbackUrl)
          }
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  try {
    return await fetchWithRetry(url)
  } catch (error) {
    console.error('All attempts to fetch file failed:', error)
    throw error
  }
}

/**
 * Determines the file extension from a URL or falls back to a default.
 *
 * @param {string} url - The URL of the file.
 * @param {string} defaultExt - The default extension to use if one can't be determined.
 * @returns {string} - The file extension (including the dot) or the default.
 */
export function getFileExtension(url, defaultExt = '.jpg') {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/i)
  return match ? `.${match[1].toLowerCase()}` : defaultExt
}
