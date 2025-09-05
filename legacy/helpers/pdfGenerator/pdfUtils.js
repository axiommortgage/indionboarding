import Cookies from 'js-cookie'
import getAccessibleUrl from '../getAccessibleUrl'

// Helper function to get JWT token from various sources
export const getJwtToken = () => {
  // First try from js-cookie
  const tokenFromJsCookie = Cookies.get('jwt')
  if (tokenFromJsCookie) {
    console.log('Found JWT in js-cookie')
    return tokenFromJsCookie
  }

  // Then try from document.cookie
  if (typeof document !== 'undefined') {
    const tokenFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('jwt='))
      ?.split('=')[1]

    if (tokenFromCookie) {
      console.log('Found JWT in document.cookie')
      return tokenFromCookie
    }

    // If not in cookies, try localStorage as fallback
    try {
      const tokenFromLocalStorage = localStorage.getItem('jwt')
      if (tokenFromLocalStorage) {
        console.log('Found JWT in localStorage')
        return tokenFromLocalStorage
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    }
  }

  console.warn('No JWT token found in any storage location')
  return null
}

// Fetch image with authentication
export const fetchImageWithAuth = async (url) => {
  if (!url) {
    console.log('No URL provided to fetchImageWithAuth')
    return null
  }

  try {
    console.log('Original image URL:', url)

    // Always try the proxy first for all images
    const accessibleUrl = getAccessibleUrl(url)
    console.log('Using proxy URL:', accessibleUrl)

    // Get JWT token
    const token = getJwtToken()
    console.log('JWT token available:', !!token)

    // Add authorization header with proper Bearer format
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set:', `Bearer ${token.substring(0, 10)}...`)
    } else {
      console.warn('No token available for Authorization header')
    }

    console.log('Sending proxy request with headers:', Object.keys(headers))

    // Try the proxy first
    try {
      const response = await fetch(accessibleUrl, {
        headers,
        credentials: 'include' // Include cookies in the request
      })

      console.log('Proxy response status:', response.status, response.statusText)

      // Log response headers for debugging
      const responseHeaders = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      console.log('Proxy response headers:', responseHeaders)

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        console.log('Successfully fetched image via proxy, size:', arrayBuffer.byteLength)
        return arrayBuffer
      }

      console.log('Proxy fetch failed:', response.status, response.statusText)

      // If we get a 401/403, log more details
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication error with proxy. Token used:', token ? `${token.substring(0, 10)}...` : 'none')

        // Try to get response text for more details
        try {
          const text = await response.text()
          console.error('Error response body:', text)
        } catch (e) {
          console.error('Could not read error response body')
        }
      }
    } catch (err) {
      console.error('Error with proxy fetch:', err)
    }

    // If proxy failed, check if this is an S3 URL and try direct access
    const isS3Url = url.includes('amazonaws.com')

    if (isS3Url) {
      console.log('Trying direct S3 URL as fallback:', url)

      // Try without auth headers first for public resources
      try {
        console.log('Trying direct S3 access without auth')
        const noAuthResponse = await fetch(url)

        if (noAuthResponse.ok) {
          console.log('Direct S3 fetch without auth succeeded')
          return await noAuthResponse.arrayBuffer()
        }

        console.log('Direct S3 fetch without auth failed:', noAuthResponse.status)
      } catch (err) {
        console.error('Error with direct S3 fetch without auth:', err)
      }

      // As a last resort, try with auth headers
      try {
        console.log('Trying direct S3 access with auth as last resort')
        const authResponse = await fetch(url, { headers })

        if (authResponse.ok) {
          console.log('Direct S3 fetch with auth succeeded')
          return await authResponse.arrayBuffer()
        }

        console.log('Direct S3 fetch with auth failed:', authResponse.status)
      } catch (err) {
        console.error('Error with direct S3 fetch with auth:', err)
      }
    }

    console.error('All fetch attempts failed for image:', url)
    return null
  } catch (err) {
    console.error('Exception in fetchImageWithAuth:', err)
    return null
  }
}
