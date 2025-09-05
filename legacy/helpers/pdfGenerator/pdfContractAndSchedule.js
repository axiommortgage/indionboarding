import { PDFDocument, rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'
import { fetchImageWithAuth, getJwtToken } from './pdfUtils'

const pdfContractAndSchedule = async (pdfDoc, formData, employerData) => {
  try {
    // Get the contract file URL with proper authentication
    const contractUrl = formData?.contractFile?.url
    if (!contractUrl) {
      console.error('No contract file URL provided')
      throw new Error('Contract file not found')
    }

    console.log('Original contract URL:', contractUrl)
    const pdfDocumentUrl = getAccessibleUrl(contractUrl)
    console.log('Transformed contract URL:', pdfDocumentUrl)

    // Get JWT token for authentication
    const token = getJwtToken()
    console.log('JWT token available for contract fetch:', !!token)

    // Fetch the contract file with authentication
    const response = await fetch(pdfDocumentUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })

    console.log('Contract fetch response status:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Failed to fetch contract: ${response.status} ${response.statusText}`)
    }

    // Get the PDF bytes
    const existingPdfBytes = await response.arrayBuffer()
    console.log('Contract PDF bytes received, size:', existingPdfBytes.byteLength)

    if (existingPdfBytes.byteLength === 0) {
      throw new Error('Received empty PDF file')
    }

    // Check if the file starts with the PDF signature (%PDF-)
    const firstBytes = new Uint8Array(existingPdfBytes.slice(0, 5))
    const pdfSignature = String.fromCharCode.apply(null, firstBytes)
    console.log('First bytes of file:', pdfSignature)

    if (!pdfSignature.startsWith('%PDF')) {
      // This isn't a valid PDF file - log the first 100 bytes to see what we got
      const preview = new Uint8Array(existingPdfBytes.slice(0, 100))
      console.error('Invalid PDF file received. First 100 bytes:', preview)
      throw new Error('Invalid PDF file received from server')
    }

    // Load the PDF document
    pdfDoc = await PDFDocument.load(existingPdfBytes)
    console.log('PDF document loaded successfully with', pdfDoc.getPageCount(), 'pages')

    const pageTotals = pdfDoc.getPageCount()
    const pages = pdfDoc.getPages()
    const lastPage = pages.length - 1
    const signaturePage = pages[lastPage]

    const { width } = signaturePage.getSize()

    // Fetch signatures and initials using our authenticated fetch
    const brokerSignature = await fetchImageWithAuth(formData?.brokerSignature?.url || '')
    const brokerInitials = await fetchImageWithAuth(formData?.brokerInitials?.url || '')
    const employerSignature = await fetchImageWithAuth(employerData?.signature?.url || '')

    // Embed the images if they were successfully fetched
    const brokerSignaturePng = brokerSignature ? await pdfDoc.embedPng(brokerSignature) : null
    const brokerInitialsPng = brokerInitials ? await pdfDoc.embedPng(brokerInitials) : null
    const employerSignaturePng = employerSignature ? await pdfDoc.embedPng(employerSignature) : null

    console.log('formData', formData)

    // Current date and time for signatures
    let formattedSigningDate

    if (formData.brokerSignatureDate && formData.brokerSignature?.updatedAt) {
      // Extract date from brokerSignatureDate and time from brokerSignature.updatedAt
      const dateComponent = moment(formData.brokerSignatureDate)
      const timeComponent = moment(formData.brokerSignature.updatedAt)

      // Create a new moment by combining date and time components
      const combinedDateTime = moment(dateComponent.format('YYYY-MM-DD'))
        .hour(timeComponent.hour())
        .minute(timeComponent.minute())
        .second(timeComponent.second())

      formattedSigningDate = combinedDateTime.format('LLLL')
    } else {
      formattedSigningDate = moment(formData.brokerSignature.updatedAt).format('LLLL')
    }

    // Positioning functions for signatures and text
    const itemPosition = (item) => {
      if (item === 'employerSignature') {
        return {
          x: 50,
          y: 130,
          width: employerData?.signature?.formats?.thumbnail?.width
            ? employerData.signature.formats.thumbnail.width / 1.51
            : 150,
          height: employerData?.signature?.formats?.thumbnail?.height
            ? employerData.signature.formats.thumbnail.height / 1.51
            : 50
        }
      }

      if (item === 'employerSignatureLine') {
        return {
          start: { x: 50, y: 130 },
          end: { x: 250, y: 130 },
          thickness: 1,
          color: rgb(0, 0, 0)
        }
      }

      if (item === 'employerBelow') {
        return {
          x: 50,
          y: 120,
          size: 10,
          lineHeight: 13
        }
      }

      if (item === 'brokerSignatureLine') {
        return {
          start: { x: width - 300, y: 130 },
          end: { x: width - 100, y: 130 },
          thickness: 1,
          color: rgb(0, 0, 0)
        }
      }

      if (item === 'brokerSignature') {
        return {
          x: width - 300,
          y: 130,
          width: formData?.brokerSignature?.formats?.thumbnail?.width
            ? formData.brokerSignature.formats.thumbnail.width / 1.51
            : 150,
          height: formData?.brokerSignature?.formats?.thumbnail?.height
            ? formData.brokerSignature.formats.thumbnail.height / 1.51
            : 50
        }
      }

      if (item === 'brokerBelow') {
        return {
          x: width - 300,
          y: 120,
          size: 10,
          lineHeight: 13
        }
      }

      if (item === 'employerDate') {
        return {
          x: 50,
          y: 100,
          size: 10,
          lineHeight: 13
        }
      }

      if (item === 'brokerDate') {
        return {
          x: width - 300,
          y: 100,
          size: 10,
          lineHeight: 13
        }
      }

      if (item === 'brokerInitials') {
        return {
          x: width - 105,
          y: 35,
          width: formData?.brokerInitials?.formats?.thumbnail?.width
            ? formData.brokerInitials.formats.thumbnail.width / 3.33
            : 75,
          height: formData?.brokerInitials?.formats?.thumbnail?.height
            ? formData.brokerInitials.formats.thumbnail.height / 3.33
            : 75
        }
      }
    }

    // Draw signatures and initials on the pages
    pages.forEach((p, i) => {
      if (pageTotals - 1 === i) {
        // Draw employer signature and details
        p.drawLine(itemPosition('employerSignatureLine'))
        if (employerSignaturePng) {
          p.drawImage(employerSignaturePng, itemPosition('employerSignature'))
        }
        p.drawText('Gordon Ross - President', itemPosition('employerBelow'))
        p.drawText(formattedSigningDate, itemPosition('employerDate'))

        // Draw broker signature and details
        p.drawLine(itemPosition('brokerSignatureLine'))
        if (brokerSignaturePng) {
          p.drawImage(brokerSignaturePng, itemPosition('brokerSignature'))
        }
        p.drawText(formData.brokerName, itemPosition('brokerBelow'))
        p.drawText(formattedSigningDate, itemPosition('brokerDate'))
      } else if (brokerInitialsPng) {
        // Draw broker initials on all other pages
        p.drawImage(brokerInitialsPng, itemPosition('brokerInitials'))
      }
    })

    await pdfDoc.embedPages(pages)

    return pdfDoc
  } catch (error) {
    console.error('Error in pdfContractAndSchedule:', error)

    // Create a fallback PDF with error information
    const fallbackPdf = await PDFDocument.create()
    const page = fallbackPdf.addPage([595.28, 841.89])

    page.drawText('Error generating contract document', {
      x: 50,
      y: page.getHeight() - 100,
      size: 16
    })

    page.drawText(`Error: ${error.message}`, {
      x: 50,
      y: page.getHeight() - 150,
      size: 12
    })

    page.drawText('Please contact support for assistance.', {
      x: 50,
      y: page.getHeight() - 200,
      size: 12
    })

    return fallbackPdf
  }
}

export default pdfContractAndSchedule
