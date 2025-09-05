import { rgb } from 'pdf-lib'

const pdfWebsiteInformation = async (pdfDoc, formData, pngLogo) => {
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

  page.drawText(`Website Information`, {
    size: 18,
    lineHeight: 18,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 100
  })

  page.drawText(`Indi Site & Domain`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 130,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Do you want an Indi Website?: ${swapValue(formData.websiteOptIn)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 150
  })

  if (formData.websiteOptIn) {
    page.drawText(
      `Which kind website address (domain name) would you like to use on your Indi Site?: ${swapValue(
        formData.ownDomain ? 'My Own Domain' : formData.providedDomain ? 'A Domain Provided By Indi' : null
      )}`,
      {
        size: 10,
        lineHeight: 14,
        maxWidth: bodyWidth,
        x: 50,
        y: height - 170
      }
    )

    page.drawText(`What is your domain name?: ${swapValue(formData.ownDomain ? formData.websiteDomainName : null)}`, {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 190
    })

    page.drawText(
      `Registrar Company (i.e. GoDaddy, Rebel, etc.): ${swapValue(
        formData.ownDomain ? formData.websiteDomainRegistrar : null
      )}`,
      {
        size: 10,
        lineHeight: 14,
        maxWidth: bodyWidth,
        x: 50,
        y: height - 210
      }
    )
  }

  page.drawText(`Do you have any existing mortgage related websites/links?: ${swapValue(formData.priorWebsite)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 240
  })

  page.drawText(`Mortgage Related Website Domains:`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 260
  })

  if (formData && formData.priorWebsitesUse && formData.priorWebsitesUse !== null) {
    let i, h

    for (i = 0, h = 280; i < formData.priorWebsitesUse.length; i++, h += 15) {
      page.drawText(`Domain: ${formData.priorWebsitesUse[i].domain}`, {
        size: 10,
        lineHeight: 14,
        maxWidth: bodyWidth,
        x: 50,
        y: height - h
      })

      page.drawText(`Keep In Use: ${swapValue(formData.priorWebsitesUse[i].keepInUse)}`, {
        size: 10,
        lineHeight: 14,
        maxWidth: bodyWidth,
        x: 280,
        y: height - h
      })

      page.drawText(`Redirect: ${swapValue(formData.priorWebsitesUse[i].redirect)}`, {
        size: 10,
        lineHeight: 14,
        maxWidth: bodyWidth,
        x: 390,
        y: height - h
      })
    }
  }

  return page
}

export default pdfWebsiteInformation
