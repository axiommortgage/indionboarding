import { rgb } from 'pdf-lib'

const pdfBusinessCard = async (pdfDoc, formData, pngLogo) => {
  //Formatting Text Case
  const toTitleCase = (text) => {
    if (text && text.length > 0) {
      const result = text.replace(/([A-Z])/g, ' $1')
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
      return finalResult
    }
    return
  }

  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const bodyWidth = width - 50
  const bodyMarginLeft = 50

  //Adding Logo
  page.drawImage(pngLogo, {
    width: 56,
    height: 42,
    x: 50,
    y: height - 60
  })

  //Drawing Texts to the Pages
  const swapValue = (value, isOptOut) => {
    if (value === false) {
      if (isOptOut) {
        return 'Yes'
      }
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

  page.drawText(`Business Card Information`, {
    size: 18,
    lineHeight: 18,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 100
  })

  page.drawText(`Social Media`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 130,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Opt In: ${swapValue(formData.businessCardOptOut, true)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 150
  })

  page.drawText(`Facebook Handle: ${swapValue(formData.facebookHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 170
  })

  page.drawText(`Instagram Handle: ${swapValue(formData.instagramHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 190
  })

  page.drawText(`Linkedin Handle: ${swapValue(formData.linkedinHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 210
  })

  page.drawText(`Twitter Handle: ${swapValue(formData.twitterHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 230
  })

  page.drawText(`Youtube Channel: ${swapValue(formData.youtubeHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 250
  })

  page.drawText(`Contact Information`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 300,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`First Name: ${swapValue(formData.firstname)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 320
  })

  page.drawText(`Middle Name: ${swapValue(formData.middlename)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 340
  })

  page.drawText(`Last Name: ${swapValue(formData.lastname)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 360
  })

  page.drawText(`Titles: ${swapValue(formData.titles)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 380
  })

  page.drawText(`Position: ${swapValue(formData.position)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 400
  })

  page.drawText(`License Number: ${swapValue(formData.license)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 420
  })

  page.drawText(`Preferred Email: ${swapValue(formData.workEmail)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 440
  })

  page.drawText(
    `Preferred Phone: ${
      formData.workPhone && formData.workPhone.masked
        ? swapValue(formData.workPhone.masked)
        : formData.workPhone
        ? swapValue(formData.workPhone)
        : ''
    }`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 460
    }
  )

  page.drawText(`Address: ${swapValue(formData.address)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 480
  })

  page.drawText(`Website: ${swapValue(formData.website)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 500
  })

  page.drawText(`Photo`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 550,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Add Photo: ${swapValue(formData.withPhoto)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 570
  })

  page.drawText(`Add QR Code: ${swapValue(formData.withQrCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 590
  })
}

export default pdfBusinessCard
