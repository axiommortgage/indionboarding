import { PDFDocument, StandardFonts } from 'pdf-lib'
import pdfBrokerInformation from './pdfBrokerInformation'
import pdfUnlicensedInformation from './pdfUnlicensedInformation'
import pdfPhotos from './pdfPhotos'
import pdfBusinessCard from './pdfBusinessCard'
import pdfWebsiteInformation from './pdfWebsiteInformation'
import pdfMpcApplication from './pdfMpcApplication'
import pdfPaymentAuthorization from './pdfPaymentAuthorization'
import pdfContractAndSchedule from './pdfContractAndSchedule'
import pdfPoliciesAndProcedure from './pdfPoliciesAndProcedure'
import pdfUnlicensedPolicies from './pdfUnlicensedPolicies'

const PdfGenerator = async (from, formName, nodes, formData, user, employerData, otherData) => {
  let pdfDoc = await PDFDocument.create()
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const logo = await fetch(`/images/Indi-Mortgage-W-Tagline.png`).then((res) => res.arrayBuffer())
  const pngLogo = await pdfDoc.embedPng(logo)

  if (formName === 'brokerInformation') {
    const brokerInfoPdf = await pdfBrokerInformation(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  if (formName === 'unlicensedInformation') {
    const unlicensedInfoPdf = await pdfUnlicensedInformation(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  //photos
  if (formName === 'photos') {
    const photosPdf = await pdfPhotos(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  //businessCard
  if (formName === 'businessCardInfo') {
    const businessCardPdf = await pdfBusinessCard(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  //axiomWebsite
  if (formName === 'websiteInformation') {
    const websiteInformationPdf = await pdfWebsiteInformation(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  //MPCApplication
  if (formName === 'mpcApplication') {
    const mpcApplicationPdf = await pdfMpcApplication(pdfDoc, formData, pngLogo, normalFont, boldFont)
  }

  //paymentAuthorization
  if (formName === 'paymentAuthorization') {
    const paymentAuthorizationPdf = await pdfPaymentAuthorization(
      pdfDoc,
      formData,
      pngLogo,
      normalFont,
      boldFont,
      nodes,
      user
    )
  }

  let contractAndSchedulePdf

  //contractAndSchedule
  if (formName === 'contractAndSchedule') {
    contractAndSchedulePdf = await pdfContractAndSchedule(pdfDoc, formData, employerData)
  }

  //policiesAndProcedure
  if (formName === 'policiesAndProcedure') {
    const policiesAndProcedurePdf = await pdfPoliciesAndProcedure(
      pdfDoc,
      formData,
      nodes,
      pngLogo,
      normalFont,
      boldFont,
      otherData
    )
  }

  //unlicensedPolicies
  if (formName === 'unlicensedPolicies') {
    const unlicensedPoliciesPdf = await pdfUnlicensedPolicies(
      pdfDoc,
      formData,
      nodes,
      pngLogo,
      normalFont,
      boldFont,
      otherData
    )
  }

  // if (formName === 'letterOfDirection') {
  //   const letterOfDirectionPdf = await pdfLetterOfDirection(pdfDoc, formData, pngLogo, normalFont, boldFont)
  // }

  let pdfBytes

  //contractAndSchedule
  if (formName === 'contractAndSchedule') {
    pdfBytes = await contractAndSchedulePdf.save()
  } else {
    pdfBytes = await pdfDoc.save()
  }

  const formatFormName = (form) => {
    return form.replace(/([A-Z])/g, ' $1').trim()
  }

  const pdfFileName = () => {
    return `${formatFormName(formName)}-${user && user.firstname ? user.firstname : ''}-${
      user && user.lastname ? user.lastname : ''
    }.pdf`.replace(' ', '-')
  }

  // pdfBytes = await pdfDoc.save()
  const bytes = new Uint8Array(pdfBytes)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const pdfFile = new File([blob], pdfFileName())
  const docUrl = URL.createObjectURL(blob)

  if (from === 'button') {
    let fileLink = document.createElement('a')
    fileLink.href = docUrl
    fileLink.download = pdfFileName()
    fileLink.click()
  }

  return {
    bytes,
    blob,
    pdfFile,
    filename: `${formName}-${user && user.firstname ? user.firstname : ''}-${
      user && user.lastname ? user.lastname : ''
    }.pdf`
  }
}

export default PdfGenerator
