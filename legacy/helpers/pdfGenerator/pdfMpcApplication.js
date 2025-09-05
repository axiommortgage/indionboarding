import { rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'
import { fetchImageWithAuth } from './pdfUtils'

const pdfBrokerInformation = async (pdfDoc, formData, pngLogo, normalFont, boldFont) => {
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
  const page2 = pdfDoc.insertPage(1, [595.28, 841.89])

  const brokerSignature = await fetchImageWithAuth(
    formData && formData.applicantDeclarationSignature && formData.applicantDeclarationSignature.url
      ? formData.applicantDeclarationSignature.url
      : ''
  )

  const brokerSignaturePng = brokerSignature ? await pdfDoc.embedPng(brokerSignature) : null

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

    if (value === undefined || value === 'undefined' || value === '') {
      return '--'
    }

    if (value === null || value === 'null') {
      return 'No'
    }

    if (value !== false && value !== true) {
      return toTitleCase(value)
    }
  }
  const clearDoubleSpaces = (text) => {
    return text.replace('  ', ' ')
  }

  page.drawText(`MPC (CAAMP) Application`, {
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
    x: (width / 3) * 2 - 50,
    y: height - 150
  })

  page.drawText(`Conversational Name: ${swapValue(formData.preferredName)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 170
  })

  page.drawText(`Website: ${swapValue(formData.website)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,
    y: height - 170
  })

  page.drawText(`Pref. Email: ${swapValue(formData.workEmail)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 190
  })

  page.drawText(`Alt. Email: ${swapValue(formData.alternateEmail)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,
    y: height - 190
  })

  page.drawText(`Mailling Address: ${swapValue(formData.address)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 210
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.suiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,    
    y: height - 210
  })

  page.drawText(`City: ${swapValue(formData.city)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 230
  })

  page.drawText(`Province: ${swapValue(formData.province)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 230
  })

  page.drawText(`Postal Code: ${swapValue(formData.postalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,
    y: height - 230
  })

  page.drawText(
    `Pref. Phone: ${swapValue(
      formData.workPhone && formData.workPhone.masked
        ? formData.workPhone.masked
        : formData.workPhone
        ? formData.workPhone
        : null
    )}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 250
    }
  )

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
      x: width / 3,
      y: height - 250
    }
  )

  page.drawText(
    `Tollfree Phone: ${swapValue(
      formData.tollfree && formData.tollfree.masked
        ? formData.tollfree.masked
        : formData.tollfree
        ? formData.tollfree
        : null
    )}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: (width / 3) * 2 - 50,
      y: height - 250
    }
  )

  page.drawText(`Fax: ${swapValue(formData.fax)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 270
  })

  page.drawText(`Position: ${swapValue(formData.position)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 270
  })

  page.drawLine({
    start: { x: 50, y: height - 300 },
    end: { x: bodyWidth, y: height - 300 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Office Information`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 330,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Address: ${swapValue(formData.officeAddress)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 350
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.officeSuiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,
    y: height - 350
  })

  page.drawText(`City: ${swapValue(formData.officeCity)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 + 30,
    y: height - 350
  })

  page.drawText(`Province: ${swapValue(formData.officeProvince)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 370
  })

  page.drawText(`Postal Code: ${swapValue(formData.officePostalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 370
  })

  page.drawText(`Office Website: ${swapValue(formData.officeWebsite)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2 - 50,
    y: height - 370
  })

  page.drawLine({
    start: { x: 50, y: height - 400 },
    end: { x: bodyWidth, y: height - 400 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Declarations`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 430,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(
    `• Have you ever been charged with, convicted of or pardoned of a criminal offense?: ${swapValue(
      formData.declarationCriminalOffense
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 450
    }
  )

  page.drawText(
    `• Are there any civil judgments or actions against you or has judgment ever been entered against you in an action involving fraud? If so, attach a copy of the judgment or action.: ${swapValue(
      formData.declarationFraud
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 470
    }
  )

  page.drawText(
    `• Have you ever been disciplined, suspended or expelled as a member of any professional organization?: ${swapValue(
      formData.declarationSuspended
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 500
    }
  )

  page.drawText(
    `• Have you ever been denied a license or permit, or had any license or permit revoked, for failure to meet good character requirements?: ${swapValue(
      formData.declarationLicenseDenied
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 520
    }
  )

  page.drawText(
    `• Are you currently subject to a petition or assignment in bankruptcy or a proposal to creditors under the Bankruptcy and Insolvency Act, or have you ever been bankrupt or insolvent, under any statute?: ${swapValue(
      formData.declarationBankruptcy
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 550
    }
  )

  page.drawText(
    `Judgement or Action File: ${swapValue(
      formData.judgementAction && formData.judgementAction.url ? formData.judgementAction.url.split(' ').join('') : ''
    )}`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 580
    }
  )

  page.drawText(`Declaration details: ${swapValue(formData.declarationDetails ? formData.declarationDetails : '')}`, {
    size: 10,
    lineHeight: 12,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 640
  })

  page2.drawText(
    `I agree to abide by any best practices or professional standards of Mortgage Professionals Canada that may be in place from time to time. I agree to abide by the Mortgage Professionals Canada Bylaws, including its Code of Ethics (“Code”) set out therein, and the policies of Mortgage Professionals Canada in place from time to time, and acknowledge having received and read a copy of the current Mortgage Professionals Canada Bylaw. I understand and agree that, if accused of a violation of the Code, I will be subject to the Mortgage Professionals Canada ethics process and penalties, which may include publication of my name.
  \nI declare that the statements made herein are for the purpose of qualifying as a member of Mortgage Professionals Canada and are true and correct. I understand and acknowledge that the statements made herein are being relied upon by Mortgage Professionals Canada, in its sole discretion, to approve my application for membership in Mortgage Professionals Canada. I hereby authorize Mortgage Professionals Canada to make all inquiries necessary to verify the accuracy of statements made herein and consent to the collection, use and disclosure of any of my personal information that Mortgage Professionals Canada deems relevant in order to approve my application for membership. I authorize my employer to pay the initial membership fee, all applicable renewal membership fees for me and to provide information updates on me to Mortgage Professionals Canada. Mortgage Professionals Canada reserves the right in its sole discretion to require the membership applicant to provide a criminal record check upon written request.`,
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 60
    }
  )

  if (brokerSignaturePng) {
    page2.drawImage(brokerSignaturePng, {
      width: formData.applicantDeclarationSignature?.formats?.thumbnail?.width
        ? formData.applicantDeclarationSignature.formats.thumbnail.width
        : 200,
      height: formData.applicantDeclarationSignature?.formats?.thumbnail?.height
        ? formData.applicantDeclarationSignature.formats.thumbnail.height
        : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
      x: 50,
      y: height - 360
    })
  }

  page2.drawText(
    clearDoubleSpaces(
      `${formData.middlename ? swapValue(formData.firstname) + ' ' +  swapValue(formData.middlename) + ' ' + swapValue(formData.lastname) : (swapValue(formData.firstname) + ' ' + swapValue(
    formData.lastname)
  )}`),
    {
      size: 10,
      lineHeight: 12,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 380
    }
  )

  page2.drawText(
    `Signed On: ${moment(formData.applicantDeclarationSignature?.createdAt).format('LLLL') || moment().format('LLLL')}`,
    {
      size: 10,
      lineHeight: 13,
      maxWidth: bodyWidth,
      x: bodyMarginLeft,
      y: height - 400
    }
  )

  return { page, page2 }
}

export default pdfBrokerInformation
