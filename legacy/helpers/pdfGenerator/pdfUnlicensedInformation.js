import { rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'
import { fetchImageWithAuth } from './pdfUtils'

const pdfBrokerInformation = async (pdfDoc, formData, pngLogo) => {
  const toTitleCase = (text) => {
    if (text && text.length > 0) {
      const result = text.replace(/([A-Z])/g, ' $1')
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
      return finalResult
    }
    return
  }

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

  // Log the signature URL to debug
  console.log('Unlicensed signature URL:', formData?.signature?.url)

  // Ensure we're handling the signature correctly
  const brokerSignature = await fetchImageWithAuth(
    formData && formData.signature && formData.signature.url ? formData.signature.url : ''
  )

  console.log('Signature fetch result:', brokerSignature ? 'Success' : 'Failed')

  // Only embed if we have a signature
  let brokerSignaturePng = null
  if (brokerSignature) {
    try {
      brokerSignaturePng = await pdfDoc.embedPng(brokerSignature)
      console.log('Signature embedded successfully')
    } catch (err) {
      console.error('Error embedding signature:', err)
    }
  }

  //Adding Logo
  page.drawImage(pngLogo, {
    width: 56,
    height: 42,
    x: 50,
    y: height - 60
  })

  page.drawText(`Information`, {
    size: 18,
    lineHeight: 18,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 100
  })

  page.drawText(`Personal & Professional`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 130,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`First Name: ${swapValue(formData.firstname)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 150
  })

  page.drawText(`Middle Name: ${swapValue(formData.middlename)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 150
  })

  page.drawText(`Last Name: ${swapValue(formData.lastname)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2,
    y: height - 150
  })

  page.drawText(`SIN: ${swapValue(formData.sin && formData.sin.masked ? formData.sin.masked : formData.sin ? formData.sin : null)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 170
  })

  page.drawText(`Postal Code: ${swapValue(formData.postalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 170
  })

  page.drawText(`Assistant To: ${swapValue(formData.assistantTo)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 190
  })

  page.drawLine({
    start: { x: 50, y: height - 210 },
    end: { x: bodyWidth, y: height - 210 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Contact`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 230,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Pref. Email: ${swapValue(formData.workEmail)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 250
  })

  page.drawText(
    `Cell Phone: ${swapValue(
      formData.cellPhone && formData.cellPhone.masked
        ? formData.cellPhone.masked
        : formData.cellPhone
        ? formData.cellPhone
        : null
    )}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: width / 2,
      y: height - 250
    }
  )

  page.drawText(`Emergency Contact: ${swapValue(formData.emergencyContact)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 270
  })

  page.drawText(
    `Emergency Phone: ${swapValue(
      formData.emergencyPhone && formData.emergencyPhone.masked
        ? formData.emergencyPhone.masked
        : formData.emergencyPhone
        ? formData.emergencyPhone
        : null
    )}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: width / 2,
      y: height - 270
    }
  )

  page.drawLine({
    start: { x: 50, y: height - 290 },
    end: { x: bodyWidth, y: height - 290 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Office Address`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 310,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Address: ${swapValue(formData.address)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 330
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.suiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 330
  })

  page.drawText(`City: ${swapValue(formData.city)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 330
  })

  page.drawText(`Province: ${swapValue(formData.province)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 350
  })

  page.drawLine({
    start: { x: 50, y: height - 370 },
    end: { x: bodyWidth, y: height - 370 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Personal Address`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 390,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Address: ${swapValue(formData.personalAddress)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 410
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.personalSuiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 410
  })

  page.drawText(`City: ${swapValue(formData.personalCity)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 410
  })

  page.drawText(`Province: ${swapValue(formData.personalProvince)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 430
  })

  page.drawText(`Postal Code: ${swapValue(formData.personalPostalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 430
  })

  /*--------------------------*/

  page.drawLine({
    start: { x: 50, y: height - 450 },
    end: { x: bodyWidth, y: height - 450 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Completing Compliance: ${swapValue(formData.completingCompliance)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 470
  })

  // Only draw the image if we have it
  if (brokerSignaturePng) {
    try {
      console.log(
        'Drawing signature with dimensions:',
        formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 320,
        formData.signature?.formats?.thumbnail?.height
          ? formData.signature.formats.thumbnail.height
          : brokerSignaturePng.height * (320 / brokerSignaturePng.width)
      )

      page.drawImage(brokerSignaturePng, {
        width: formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 200,
        height: formData.signature?.formats?.thumbnail?.height
          ? formData.signature.formats.thumbnail.height
          : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
        x: 50,
        y: height - 580
      })
      console.log('Signature drawn successfully')
    } catch (err) {
      console.error('Error drawing signature:', err)
    }
  } else {
    console.log('No signature to draw')
  }

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
      y: height - 570
    }
  )
  const now = moment(formData.signature?.createdAt).format('LLLL') || moment().format('LLLL')

  page.drawText(`Signed On: ${now}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 53,
    y: height - 590
  })

  return page
}

export default pdfBrokerInformation
