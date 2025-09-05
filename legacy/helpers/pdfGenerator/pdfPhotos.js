import { rgb } from 'pdf-lib'

const normalizeImageUrl = (url) => {
  if (!url) return ''

  // Fix duplicated paths like /public/images/public/images/
  if (url.includes('/public/images/public/images/')) {
    return url.replace('/public/images/public/images/', '/public/images/')
  }

  return url
}

const pdfPhotos = async (pdfDoc, formData, pngLogo) => {
  const page = pdfDoc.addPage([595.28, 841.89])

  const { width, height } = page.getSize()
  const bodyWidth = width - 50

  console.log(formData)

  let dgtPhoto = null
  let prtPhoto = null

  // Helper function to fetch images directly
  const fetchImage = async (imageUrl) => {
    if (!imageUrl) return null

    try {
      // Normalize the URL to fix path duplication
      const normalizedUrl = normalizeImageUrl(imageUrl)
      console.log('Fetching image from:', normalizedUrl)

      const response = await fetch(normalizedUrl, {
        credentials: 'include' // Include cookies in case they're needed
      })

      console.log('Response:', response)

      console.log('Response status:', response.status)

      if (!response.ok) {
        console.error('Failed to fetch image:', response.status)
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log('Successfully fetched image, size:', arrayBuffer.byteLength)
      return arrayBuffer
    } catch (err) {
      console.error('Error fetching image:', err)
      return null
    }
  }

  // Helper function to calculate image dimensions from embedded PDFImage
  const calculateImageDimensions = (embeddedImage, maxWidth = 200, maxHeight = 200) => {
    if (!embeddedImage) return { width: maxWidth, height: maxHeight }

    // Get actual dimensions from the embedded image
    const imgWidth = embeddedImage.width
    const imgHeight = embeddedImage.height

    // Calculate aspect ratio
    const aspectRatio = imgWidth / imgHeight

    // Determine dimensions based on aspect ratio
    let finalWidth = maxWidth
    let finalHeight = maxWidth / aspectRatio

    // If height exceeds maxHeight, adjust dimensions
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight
      finalWidth = maxHeight * aspectRatio
    }

    console.log(`Original dimensions: ${imgWidth}x${imgHeight}, Calculated: ${finalWidth}x${finalHeight}`)
    return { width: finalWidth, height: finalHeight }
  }

  // Fetch digital photo
  if (formData && formData.photo && formData.photo.url) {
    console.log('Fetching digital photo:', formData.photo.url)
    const brokerPhoto = await fetchImage(formData.photo.url)

    if (brokerPhoto) {
      try {
        if (formData.photo.ext.toLowerCase() === '.jpg' || formData.photo.ext.toLowerCase() === '.jpeg') {
          dgtPhoto = await pdfDoc.embedJpg(brokerPhoto)
          console.log('Successfully embedded JPEG digital photo')
        } else if (formData.photo.ext.toLowerCase() === '.png') {
          dgtPhoto = await pdfDoc.embedPng(brokerPhoto)
          console.log('Successfully embedded PNG digital photo')
        } else {
          console.error('Unsupported image format for digital photo:', formData.photo.ext)
        }
      } catch (err) {
        console.error('Error embedding digital photo:', err)
      }
    }
  }

  // Fetch print photo
  if (formData && formData.printPhoto && formData.printPhoto.url) {
    console.log('Fetching print photo:', formData.printPhoto.url)
    const brokerPrintPhoto = await fetchImage(formData.printPhoto.url)

    if (brokerPrintPhoto) {
      try {
        if (formData.printPhoto.ext.toLowerCase() === '.jpg' || formData.printPhoto.ext.toLowerCase() === '.jpeg') {
          prtPhoto = await pdfDoc.embedJpg(brokerPrintPhoto)
          console.log('Successfully embedded JPEG print photo')
        } else if (formData.printPhoto.ext.toLowerCase() === '.png') {
          prtPhoto = await pdfDoc.embedPng(brokerPrintPhoto)
          console.log('Successfully embedded PNG print photo')
        } else {
          console.error('Unsupported image format for print photo:', formData.printPhoto.ext)
        }
      } catch (err) {
        console.error('Error embedding print photo:', err)
      }
    }
  }

  console.log(dgtPhoto, prtPhoto)

  //Adding Logo
  page.drawImage(pngLogo, {
    width: 56,
    height: 42,
    x: 50,
    y: height - 60
  })

  page.drawText(`Photos`, {
    size: 18,
    lineHeight: 18,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 100
  })

  page.drawText(`Digital Photo`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 130,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Print Photo`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: bodyWidth / 2 + 60,
    y: height - 130,
    color: rgb(0.16, 0.47, 0.58)
  })

  if (dgtPhoto) {
    try {
      // Calculate appropriate dimensions for digital photo using embedded image dimensions
      const digitalDimensions = calculateImageDimensions(dgtPhoto, 200, 250)

      await page.drawImage(dgtPhoto, {
        width: digitalDimensions.width,
        height: digitalDimensions.height,
        x: 50,
        y: height - 400
      })
      console.log('Successfully drew digital photo on page')
    } catch (err) {
      console.error('Error drawing digital photo:', err)
    }
  } else {
    console.log('No digital photo to draw')
    page.drawText('No digital photo available', {
      size: 10,
      x: 50,
      y: height - 200
    })
  }

  if (prtPhoto) {
    try {
      // Calculate appropriate dimensions for print photo using embedded image dimensions
      const printDimensions = calculateImageDimensions(prtPhoto, 200, 250)

      await page.drawImage(prtPhoto, {
        width: printDimensions.width,
        height: printDimensions.height,
        x: bodyWidth / 2 + 60,
        y: height - 400
      })
      console.log('Successfully drew print photo on page')
    } catch (err) {
      console.error('Error drawing print photo:', err)
    }
  } else {
    console.log('No print photo to draw')
    page.drawText('No print photo available', {
      size: 10,
      x: bodyWidth / 2 + 60,
      y: height - 200
    })
  }

  return page
}

export default pdfPhotos
