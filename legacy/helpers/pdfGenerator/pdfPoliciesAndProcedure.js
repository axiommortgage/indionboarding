import { rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'
import { fetchImageWithAuth } from './pdfUtils'

const pdfPoliciesAndProcedure = async (pdfDoc, formData, nodes, pngLogo, normalFont, boldFont, otherData) => {
  //Formatting Text Case
  const toTitleCase = (text) => {
    if (text && text.length > 0) {
      const result = text.replace(/([A-Z])/g, ' $1')
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
      return finalResult
    }
    return
  }

  console.log('formData', formData)
  console.log('otherData', otherData)


  //Drawing Texts to the Pages
  const swapValue = (value) => {
    if (value === false) {
      return 'No'
    }

    if (value === true) {
      return 'Yes'
    }

    if (value === undefined || value === 'undefined' || value === '' || value === null || value === 'null') {
      return '--'
    }

    if (value !== false && value !== true) {
      return toTitleCase(value)
    }
  }
  const clearDoubleSpaces = (text) => {
    return text.replace('  ', ' ')
  }

  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const bodyWidth = width - 50
  const bodyMarginLeft = 50

  const brokerSignature = await fetchImageWithAuth(
    formData && formData.signature && formData.signature.url ? formData.signature.url : ''
  )

  const brokerSignaturePng = brokerSignature ? await pdfDoc.embedPng(brokerSignature) : null

  //Adding Logo
  page.drawImage(pngLogo, {
    width: 56,
    height: 42,
    x: 50,
    y: height - 60
  })

  page.drawText(`Policies and Procedures Acknowledgement`, {
    size: 18,
    lineHeight: 18,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 100
  })

  page.drawText(
    `I acknowledge that I have read the Indi Mortgage (the "brokerage") Policies and Procedures Manual* (the "Manual") in its entirety. I confirm that I will adhere to the practices and procedures contained within.`,
    {
      size: 10,
      lineHeight: 13,
      maxWidth: bodyWidth - 40,
      x: bodyMarginLeft,
      y: height - 180
    }
  )

  page.drawText(
    'I also acknowledge it is my sole responsibility to keep updated on any changes made to the Manual and that changes made will be communicated to me by the brokerage.',
    {
      size: 10,
      lineHeight: 13,
      maxWidth: bodyWidth - 40,
      x: bodyMarginLeft,
      y: height - 220
    }
  )

  page.drawText(`*Manual: ${otherData}`, {
    size: 7,
    lineHeight: 13,
    maxWidth: bodyWidth - 40,
    x: bodyMarginLeft,
    y: height - 260,
    font: boldFont
  })

  if (brokerSignaturePng) {
    page.drawImage(brokerSignaturePng, {
      width: formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 200,
      height: formData.signature?.formats?.thumbnail?.height
        ? formData.signature.formats.thumbnail.height
        : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
      x: 50,
      y: height - 380
    })
  }

  if(formData && formData.brokerName) {
    page.drawText(
      clearDoubleSpaces(
         swapValue(formData.brokerName)),
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 410
    }
  )
  }else{
    page.drawText(
      clearDoubleSpaces(
        `${formData.middlename ? swapValue(formData.firstname) + ' ' +  swapValue(formData.middlename) + ' ' + swapValue(formData.lastname) : (swapValue(formData.firstname) + ' ' + swapValue(
      formData.lastname)
    )}`),
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 410
    })
  }

  

  page.drawText(`Signed On: ${moment(formData.signature?.createdAt).format('LLLL') || moment().format('LLLL')}`, {
    size: 10,
    lineHeight: 13,
    maxWidth: bodyWidth,
    x: bodyMarginLeft,
    y: height - 430,
    font: boldFont
  })

  return page
}

export default pdfPoliciesAndProcedure
