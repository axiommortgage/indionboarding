import { rgb } from 'pdf-lib'
import moment from 'moment'
import getAccessibleUrl from '../getAccessibleUrl'
import { fetchImageWithAuth } from './pdfUtils'

const pdfPaymentAuthorization = async (pdfDoc, formData, pngLogo, normalFont, boldFont, nodes, user) => {
  //Formatting Text Case
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

  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const bodyWidth = width - 50
  const bodyMarginLeft = 50

  if (formData && formData.payrollRequired) {
    const brokerSignature = await fetchImageWithAuth(
      formData && formData.signature && formData.signature.url ? formData.signature.url : ''
    )

    const brokerSignaturePng = brokerSignature ? await pdfDoc.embedPng(brokerSignature) : null

    const getAccountType = () => {
      if (formData.chequingAccount === true) {
        return 'Chequing Account'
      } else if (formData.savingsAccount === true) {
        return 'Savings Account'
      } else {
        return '--'
      }
    }
    //Adding Logo
    page.drawImage(pngLogo, {
      width: 56,
      height: 42,
      x: 50,
      y: height - 60
    })

    page.drawText(`Payment Authorization`, {
      size: 18,
      lineHeight: 18,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 100
    })

    if (user && user.licensed === true) {
      page.drawText(
        'This Payment Authorization form authorizes Indi Mortgage to deduct expenses (owing) directly from your bank account in the event you do not have the available funds in your payroll account for 2 consecutive months.',
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 40,
          x: bodyMarginLeft,
          y: height - 130
        }
      )

      page.drawText(
        'ie. If you do not have active payroll over a 2 month period , the expenses outstanding will be deducted directly from your chequing or savings account.',
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 40,
          x: bodyMarginLeft,
          y: height - 175
        }
      )

      page.drawText(
        'Detailed pay statements outlining expenses can be found by logging into your payroll and selecting Commissions.',
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 40,
          x: bodyMarginLeft,
          y: height - 210
        }
      )

      page.drawText(
        'By signing below you are agreeing to payment of your owed expenses by debit to the account shown.',
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 235,
          font: boldFont
        }
      )

      page.drawLine({
        start: { x: 50, y: height - 250 },
        end: { x: bodyWidth, y: height - 250 },
        thickness: 2,
        color: rgb(0.84, 0.87, 0.91)
      })

      page.drawText(`I, ${formData.brokerName} authorize Indi Mortgage to charge my bank account as indicated below:`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 280
      })

      page.drawText(`Account Type: ${swapValue(getAccountType())}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 310
      })

      page.drawText(`Paid in a Company Account: ${swapValue(formData.companyAccount)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 330
      })

      page.drawText(`Business Number: ${swapValue(formData.businessNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 350
      })

      page.drawText(
        `Articles of Incorporation: ${swapValue(
          formData.articlesOfIncorporation && formData.articlesOfIncorporation
            ? getAccessibleUrl(formData.articlesOfIncorporation.url).split(' ').join('')
            : ''
        )}`,
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 370
        }
      )

      page.drawText(`Name On Account: ${swapValue(formData.nameOnAccount)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 410
      })

      page.drawText(`Bank Name: ${swapValue(formData.bankName)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 430
      })

      page.drawText(`Transit Number: ${swapValue(formData.transitNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 450
      })

      page.drawText(`Institution Number: ${swapValue(formData.institutionNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 470
      })

      page.drawText(`Account Number: ${swapValue(formData.accountNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 490
      })

      page.drawText(`Bank Address: ${swapValue(formData.bankAddress)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 510
      })

      if (formData.birthdate) {
        page.drawText(`Birth Date: ${swapValue(formData.birthdate)}`, {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 530
        })
      }

      if (formData.sin) {
        page.drawText(`SIN: ${swapValue(formData.sin)}`, {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 550
        })
      }

      page.drawText(`Should you wish outstanding expenses to be collected via credit card?`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 600
      })

      page.drawText(swapValue(formData.creditCardExpenses), {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 620
      })

      if (brokerSignaturePng) {
        page.drawImage(brokerSignaturePng, {
          width: formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 200,
          height: formData.signature?.formats?.thumbnail?.height
            ? formData.signature.formats.thumbnail.height
            : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
          x: 50,
          y: height - 800
        })
      }

      page.drawText(`Signed On: ${moment(formData.signature?.createdAt).format('LLLL') || moment().format('LLLL')}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth,
        x: bodyMarginLeft,
        y: height - 810,
        font: boldFont
      })
    } else {
      page.drawText(`I, ${formData.brokerName} authorize Indi Mortgage to charge my bank account as indicated below:`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 130
      })

      page.drawText(`Account Type: ${swapValue(getAccountType())}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 180
      })

      page.drawText(`Paid in a Company Account: ${swapValue(formData.companyAccount)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 200
      })

      page.drawText(`Business Number: ${swapValue(formData.businessNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 220
      })

      page.drawText(
        `Articles of Incorporation: ${swapValue(
          formData.articlesOfIncorporation && formData.articlesOfIncorporation
            ? getAccessibleUrl(formData.articlesOfIncorporation.url).split(' ').join('')
            : ''
        )}`,
        {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 240
        }
      )

      page.drawText(`Name On Account: ${swapValue(formData.nameOnAccount)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 260
      })

      page.drawText(`Bank Name: ${swapValue(formData.bankName)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 280
      })

      page.drawText(`Transit Number: ${swapValue(formData.transitNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 300
      })

      page.drawText(`Institution Number: ${swapValue(formData.institutionNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 320
      })

      page.drawText(`Account Number: ${swapValue(formData.accountNumber)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 340
      })

      page.drawText(`Bank Address: ${swapValue(formData.bankAddress)}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth - 50,
        x: bodyMarginLeft,
        y: height - 360
      })

      if (formData.birthdate) {
        page.drawText(`Birth Date: ${swapValue(formData.birthdate)}`, {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 380
        })
      }

      if (formData.sin) {
        page.drawText(`SIN: ${swapValue(formData.sin)}`, {
          size: 10,
          lineHeight: 13,
          maxWidth: bodyWidth - 50,
          x: bodyMarginLeft,
          y: height - 400
        })
      }

      if (brokerSignaturePng) {
        page.drawImage(brokerSignaturePng, {
          width: formData.signature?.formats?.thumbnail?.width ? formData.signature.formats.thumbnail.width : 200,
          height: formData.signature?.formats?.thumbnail?.height
            ? formData.signature.formats.thumbnail.height
            : brokerSignaturePng.height * (200 / brokerSignaturePng.width), // Calculate proportional height
          x: 50,
          y: height - 800
        })
      }

      page.drawText(`Signed On: ${moment(formData.signature?.createdAt).format('LLLL') || moment().format('LLLL')}`, {
        size: 10,
        lineHeight: 13,
        maxWidth: bodyWidth,
        x: bodyMarginLeft,
        y: height - 810,
        font: boldFont
      })
    }
  } else {
    //Adding Logo
    page.drawImage(pngLogo, {
      width: 56,
      height: 42,
      x: 50,
      y: height - 60
    })

    page.drawText(`Payment Authorization`, {
      size: 18,
      lineHeight: 18,
      maxWidth: bodyWidth,
      x: 50,
      y: height - 100
    })

    page.drawText(`Is Indi facilitating payroll?: No`, {
      size: 10,
      lineHeight: 13,
      maxWidth: bodyWidth - 50,
      x: bodyMarginLeft,
      y: height - 130
    })
  }

  return page
}

export default pdfPaymentAuthorization
