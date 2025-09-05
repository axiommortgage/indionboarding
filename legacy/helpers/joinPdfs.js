import { PDFDocument, embedPdf } from 'pdf-lib'

const joinPdfs = async (formData, user) => {
  const appendPdf = async () => {
    let pdfDoc = await PDFDocument.create()

    for (const f of formData) {
      let sourcePdf = await fetch(f).then((res) => res.arrayBuffer())
      const pagesArray = await pdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices())

      for (const page of pagesArray) {
        pdfDoc.addPage(page)
      }
    }

    const pdfBytes = await pdfDoc.save()
    const bytes = await new Uint8Array(pdfBytes)
    const blob = await new Blob([bytes], { type: 'application/pdf' })
    const docUrl = await URL.createObjectURL(blob)
    const pdfFile = await new File([blob], `onboarding-${user.firstname}-${user.lastname}-${user.id}.pdf`)

    return { pdfFile, blob, docUrl }
  }

  const finalPDF = () =>
    appendPdf()
      .then((res) => {
        return res
      })
      .catch((err) => console.log(err))

  finalPDF()
  await window.open(finalPDF.docUrl)

  return finalPDF
}

export default joinPdfs
