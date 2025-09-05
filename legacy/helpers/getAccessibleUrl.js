// Client-side function to transform S3 URLs to proxy URLs
function getAccessibleUrl(url) {
  // Basic logging to confirm function is called
  console.log('getAccessibleUrl called with:', url)

  if (!url) {
    console.log('URL is empty or null')
    return ''
  }

  // Check if this is a private S3 URL that needs transformation
  if (url.includes('s3.') && url.includes('/private/')) {
    console.log('Detected private S3 URL')

    // Extract the path parts after '/private/'
    const privateIndex = url.indexOf('/private/')
    if (privateIndex === -1) return url

    const pathAfterPrivate = url.substring(privateIndex + '/private/'.length)

    // Determine if this is an image or a file (PDF)
    let baseEndpoint = ''
    let pathParam = ''

    if (pathAfterPrivate.startsWith('images/')) {
      // Handle images
      baseEndpoint = '/upload/upload/private/images'
      // Remove 'images/' from the path
      pathParam = pathAfterPrivate.substring('images/'.length)
    } else if (pathAfterPrivate.startsWith('files/')) {
      // Handle files (PDFs)
      baseEndpoint = '/upload/upload/private/files'
      // Remove 'files/' from the path
      pathParam = pathAfterPrivate.substring('files/'.length)
    } else {
      // Default case - use the full path
      baseEndpoint = '/upload/upload/private'
      pathParam = pathAfterPrivate
    }

    // Create the transformed URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'
    const transformedUrl = `${apiUrl}${baseEndpoint}?path=${encodeURIComponent(pathParam)}`

    console.log('Original URL:', url)
    console.log('Transformed to:', transformedUrl)

    return transformedUrl
  }

  // If not a private S3 URL, return the original
  return url
}

export default getAccessibleUrl
