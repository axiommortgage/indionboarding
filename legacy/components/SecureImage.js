import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import getAccessibleUrl from '../helpers/getAccessibleUrl'

const SecureImage = ({ src, alt, className, style, ...props }) => {
  const [imageSrc, setImageSrc] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Helper function to get JWT token from various sources
  const getJwtToken = () => {
    // First try from js-cookie
    const tokenFromJsCookie = Cookies.get('jwt')
    if (tokenFromJsCookie) {
      return tokenFromJsCookie
    }

    // Then try from document.cookie
    const tokenFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('jwt='))
      ?.split('=')[1]

    if (tokenFromCookie) {
      return tokenFromCookie
    }

    // If not in cookies, try localStorage as fallback
    try {
      return localStorage.getItem('jwt')
    } catch (e) {
      console.error('Error accessing localStorage:', e)
      return null
    }
  }

  useEffect(() => {
    console.log('SecureImage received src:', src)

    if (!src) {
      console.log('SecureImage: src is empty')
      setError(true)
      setLoading(false)
      return
    }

    const fetchImage = async () => {
      try {
        // Check if this is an S3 URL
        const isS3Url = src.includes('amazonaws.com')
        const isPrivateS3 = isS3Url && src.includes('/private/')

        // For public S3 URLs, use them directly
        if (isS3Url && !isPrivateS3) {
          console.log('Using public S3 URL directly:', src)
          setImageSrc(src)
          setLoading(false)
          setError(false)
          return
        }

        // For private S3 URLs or other URLs, use the proxy
        const accessibleUrl = getAccessibleUrl(src)
        console.log('Fetching image from:', accessibleUrl)

        // Get the JWT token
        const token = getJwtToken()

        if (!token && isPrivateS3) {
          console.error('No JWT token found for authentication of private image')
        }

        // Make sure we're sending the token correctly
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              Accept: 'image/*'
            }
          : {}

        console.log('Sending request with headers:', headers)

        // Get the image with proper binary handling
        const response = await axios.get(accessibleUrl, {
          responseType: 'arraybuffer', // Change to arraybuffer for binary data
          headers: headers
        })

        console.log('Proxy response received with status:', response.status)

        // Handle binary image data
        if (response.status === 200) {
          const contentType = response.headers['content-type'] || 'image/png'
          const blob = new Blob([response.data], { type: contentType })
          const blobUrl = URL.createObjectURL(blob)

          console.log('Created blob URL from image data:', blobUrl)
          setImageSrc(blobUrl)
          setLoading(false)
          setError(false)
        } else {
          console.error('Unexpected response status:', response.status)
          setError(true)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching image:', err)

        // If there was an error, try using the original S3 URL as fallback
        if (src.includes('amazonaws.com')) {
          console.log('Trying original S3 URL as fallback')
          setImageSrc(src)
          setLoading(false)
        } else {
          setError(true)
          setLoading(false)
        }
      }
    }

    fetchImage()

    // Clean up blob URL on unmount
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [src])

  // Handle image load error
  const handleImageError = () => {
    console.error('Error loading image with URL:', imageSrc)

    // If the image fails to load and we're not already using the original URL,
    // try the original URL as a last resort
    if (imageSrc !== src) {
      console.log('Trying original URL as last resort:', src)
      setImageSrc(src)
    } else {
      setError(true)
    }
  }

  if (error) {
    return (
      <div className={className} style={{ ...style, background: '#f0f0f0', padding: '10px' }}>
        Image unavailable
      </div>
    )
  }

  return (
    <>
      {loading && <div style={{ padding: '10px' }}>Loading image...</div>}
      {!loading && !error && (
        <img
          src={imageSrc}
          alt={alt || ''}
          className={className || ''}
          style={style || {}}
          onError={handleImageError}
          {...props}
        />
      )}
    </>
  )
}

export default SecureImage
