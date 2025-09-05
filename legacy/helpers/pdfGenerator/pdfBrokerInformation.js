import { rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'

const fetchImageWithAuth = async (url) => {
  if (!url) return null

  try {
    const accessibleUrl = getAccessibleUrl(url)
    console.log('Fetching image from:', accessibleUrl)

    // Get JWT token from cookies
    let token = null
    if (typeof document !== 'undefined') {
      token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('jwt='))
        ?.split('=')[1]

      if (!token) {
        try {
          token = localStorage.getItem('jwt')
        } catch (e) {
          console.error('Error accessing localStorage:', e)
        }
      }
    }

    // Add authorization header for private resources
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    console.log('Using headers:', headers)

    const response = await fetch(accessibleUrl, { headers })
    if (!response.ok) {
      console.error('Error fetching image:', response.status, response.statusText)
      return null
    }

    return await response.arrayBuffer()
  } catch (err) {
    console.error('Exception fetching image:', err)
    return null
  }
}

const clearDoubleSpaces = (text) => {
  return text.replace('  ', ' ')
}

const pdfBrokerInformation = async (pdfDoc, formData, pngLogo) => {
  const toTitleCase = (text) => {
    if (text && text.length > 0) {
      const result = text.replace(/([A-Z])/g, ' $1')
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
      return finalResult
    }
    return
  }

  const yPositionRate = (prevItemPos) => prevItemPos + 20

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

  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const bodyWidth = width - 50
  const page2 = pdfDoc.insertPage(1, [595.28, 841.89])

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

  page.drawText(`Broker Information`, {
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

  page.drawText(`Legal Name: ${swapValue(formData.legalName)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 170
  })

  page.drawText(`Preferred Name: ${swapValue(formData.preferredName)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 170
  })

  page.drawText(`Titles: ${swapValue(formData.titles)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 190
  })

  page.drawText(`Position: ${swapValue(formData.position)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 190
  })

  page.drawText(`License Number: ${swapValue(formData.license)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2,
    y: height - 190
  })

  page.drawText(`Birthdate: ${swapValue(formData.birthdate)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 210
  })

  page.drawText(
    `SIN: ${swapValue(formData.sin && formData.sin.masked ? formData.sin.masked : formData.sin ? formData.sin : null)}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: width / 3,
      y: height - 210
    }
  )

  page.drawText(`T-Shirt Size: ${swapValue(formData.tshirtSize)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: (width / 3) * 2,
    y: height - 210
  })

  page.drawLine({
    start: { x: 50, y: height - 230 },
    end: { x: bodyWidth, y: height - 230 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Contact`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 250,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Pref. Email: ${swapValue(formData.workEmail)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 270
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
      x: width / 2,
      y: height - 270
    }
  )

  page.drawText(`Ext.: ${swapValue(formData.ext)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 160,
    y: height - 270
  })

  page.drawText(
    `Home Phone: ${swapValue(
      formData.homePhone && formData.homePhone.masked
        ? formData.homePhone.masked
        : formData.homePhone
        ? formData.homePhone
        : null
    )}`,
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 290
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
      x: width / 2,
      y: height - 290
    }
  )

  page.drawText(`Emergency Contact: ${swapValue(formData.emergencyContact)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 310
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
      y: height - 310
    }
  )

  page.drawLine({
    start: { x: 50, y: height - 330 },
    end: { x: bodyWidth, y: height - 330 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Brokering Background`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 350,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`1st Lender - Name: ${swapValue(formData.lender1)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 370
  })

  page.drawText(`1st Lender - Volume: ${swapValue(formData.lender1Volume)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 370
  })

  page.drawText(`2nd Lender - Name: ${swapValue(formData.lender2)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 390
  })

  page.drawText(`2nd Lender - Volume: ${swapValue(formData.lender2Volume)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 390
  })

  page.drawText(`3rd Lender - Name: ${swapValue(formData.lender3)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 410
  })

  page.drawText(`3rd Lender - Volume: ${swapValue(formData.lender3Volume)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 410
  })

  if (formData && formData?.mortgageSoftware?.toLowerCase() === 'other') {
    page.drawText(`Software Platform: ${swapValue(formData.otherMortgageSoftware)}`, {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: width / 2 + 50,
      y: height - 430
    })
  } else {
    page.drawText(`Software Platform: ${swapValue(formData?.mortgageSoftware)}`, {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth,
      x: width / 2 + 50,
      y: height - 430
    })
  }

  page.drawText(`Mortgage Application Link: ${swapValue(formData.applicationLink)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 430
  })

  page.drawLine({
    start: { x: 50, y: height - 450 },
    end: { x: bodyWidth, y: height - 450 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Personal Address`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 470,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Address: ${swapValue(formData.personalAddress)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 490
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.personalSuiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 490
  })

  page.drawText(`City: ${swapValue(formData.personalCity)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 490
  })

  page.drawText(`Province: ${swapValue(formData.personalProvince)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 510
  })

  page.drawText(`Postal Code: ${swapValue(formData.personalPostalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 510
  })

  /*--------------------------*/
  page.drawLine({
    start: { x: 50, y: height - 530 },
    end: { x: bodyWidth, y: height - 530 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Office Address`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 550,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Address: ${swapValue(formData.address)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 570
  })

  page.drawText(`Suite/Unit: ${swapValue(formData.suiteUnit)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 3,
    y: height - 570
  })

  page.drawText(`City: ${swapValue(formData.city)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 570
  })

  page.drawText(`Province: ${swapValue(formData.province)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 590
  })

  page.drawText(`Postal Code: ${swapValue(formData.postalCode)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2,
    y: height - 590
  })

  page.drawText(`Brokerage License: ${swapValue(formData.brokerageLicense)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 610
  })

  page.drawLine({
    start: { x: 50, y: height - 630 },
    end: { x: bodyWidth, y: height - 630 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page.drawText(`Social Media`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 650,
    color: rgb(0.16, 0.47, 0.58)
  })

  page.drawText(`Facebook: ${swapValue(formData.facebook)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 670
  })

  page.drawText(`Facebook Handle: ${swapValue(formData.facebookHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 670
  })

  page.drawText(`Instagram: ${swapValue(formData.instagram)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 690
  })

  page.drawText(`Instagram Handle: ${swapValue(formData.instagramHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 690
  })

  page.drawText(`Linkedin: ${swapValue(formData.linkedin)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 710
  })

  page.drawText(`Linkedin Handle: ${swapValue(formData.linkedinHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 710
  })

  page.drawText(`Twitter: ${swapValue(formData.twitter)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 730
  })

  page.drawText(`Twitter Handle: ${swapValue(formData.twitterHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 730
  })

  page.drawText(`Youtube: ${swapValue(formData.youtube)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 750
  })

  page.drawText(`Youtube Handle: ${swapValue(formData.youtubeHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 750
  })

  page.drawText(`Threads: ${swapValue(formData.threads)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 770
  })

  page.drawText(`Threads Handle: ${swapValue(formData.threadsHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 770
  })

  page.drawText(`Pinterest: ${swapValue(formData.pinterest)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 790
  })

  page.drawText(`Pinterest Handle: ${swapValue(formData.pinterestHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 790
  })

  page.drawText(`Bluesky: ${swapValue(formData.bluesky)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 810
  })

  page.drawText(`Bluesky Handle: ${swapValue(formData.blueskyHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 810
  })

  page.drawText(`Tiktok: ${swapValue(formData.tiktok)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 830
  })

  page.drawText(`Tiktok Handle: ${swapValue(formData.tiktokHandler)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: width / 2 + 60,
    y: height - 830
  })

  // page.drawLine({
  //   start: { x: 50, y: height - 650 },
  //   end: { x: bodyWidth, y: height - 650 },
  //   thickness: 2,
  //   color: rgb(0.84, 0.87, 0.91)
  // })

  page2.drawText(`Additional Information`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 40,
    color: rgb(0.16, 0.47, 0.58)
  })

  page2.drawText(`Bio: ${swapValue(formData.bio)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 60
  })

  page2.drawText(`Additional Notes: ${swapValue(formData.additionalNotes)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 180
  })

  page2.drawLine({
    start: { x: 50, y: height - 225 },
    end: { x: bodyWidth, y: height - 225 },
    thickness: 2,
    color: rgb(0.84, 0.87, 0.91)
  })

  page2.drawText(`Declarations`, {
    size: 14,
    lineHeight: 14,
    maxWidth: bodyWidth,
    x: 50,
    y: height - 250,
    color: rgb(0.16, 0.47, 0.58)
  })

  page2.drawText(`Has Declaration Regulatory Review Complaint: ${swapValue(formData.declarationRegulatoryReview)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 270
  })

  page2.drawText(`Regulatory Review Complaint Details: ${swapValue(formData.declarationRegulatoryReviewDetails)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 290
  })

  page2.drawText(`Has Declaration Regulatory Review Complaint: ${swapValue(formData.declarationClientComplaints)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 400
  })

  page2.drawText(`Client Complaints Details: ${swapValue(formData.declarationClientComplaintsDetails)}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 50,
    y: height - 420
  })

  page2.drawText(
    'Credit Bureau Authorization: I authorize Indi Mortgage to obtain my credit report and keep on file as per Equifax best practice requirements.',
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 560
    }
  )

  if (brokerSignaturePng) {
    page2.drawImage(brokerSignaturePng, {
      width: formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 200,
      height: formData.signature?.formats?.thumbnail?.height
        ? formData.signature.formats.thumbnail.height
        : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
      x: 50,
      y: height - 700
    })
  }

  page2.drawText(clearDoubleSpaces(
    `${formData.middlename ? swapValue(formData.firstname) + ' ' +  swapValue(formData.middlename) + ' ' + swapValue(formData.lastname) : (swapValue(formData.firstname) + ' ' + swapValue(
      formData.lastname)
    )}`),
    {
      size: 10,
      lineHeight: 14,
      maxWidth: bodyWidth - 50,
      x: 50,
      y: height - 750
    }
  )
  const now = moment(formData.signature?.createdAt).format('LLLL') || moment().format('LLLL')

  page2.drawText(`Signed On: ${now}`, {
    size: 10,
    lineHeight: 14,
    maxWidth: bodyWidth - 50,
    x: 53,
    y: height - 770
  })

  return page
}

export default pdfBrokerInformation
