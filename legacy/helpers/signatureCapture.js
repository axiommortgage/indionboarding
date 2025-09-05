// helpers/signatureHelper.js

/**
 * Captures signature from canvas and converts it to a blob
 * Works across different browsers including Safari
 *
 * @param {React.RefObject} signaturePadRef - Reference to the SignaturePad component
 * @param {React.RefObject} containerRef - Reference to the container div
 * @param {Object} htmlToImage - html-to-image library
 * @returns {Promise<Blob>} - Promise that resolves to the signature blob
 */
export const captureSignature = async (signaturePadRef, containerRef, htmlToImage) => {
  if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
    throw new Error('Signature is empty')
  }

  try {
    let signatureBlob

    // Safari-specific handling
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      // Get the canvas element and its data directly
      const canvas = signaturePadRef.current._canvas
      const dataUrl = canvas.toDataURL('image/png')

      // Convert base64 to blob
      const base64Response = await fetch(dataUrl)
      signatureBlob = await base64Response.blob()
    } else {
      // For other browsers, use html-to-image
      const node = containerRef.current
      signatureBlob = await htmlToImage.toBlob(node)
    }

    // Validate blob
    if (!signatureBlob || signatureBlob.size < 1000) {
      throw new Error('Generated signature appears to be empty or invalid')
    }

    return signatureBlob
  } catch (error) {
    throw new Error(`Failed to capture signature: ${error.message}`)
  }
}

/**
 * Creates a FormData object with the signature blob and metadata
 *
 * @param {Blob} signatureBlob - The signature blob
 * @param {Object} user - User object containing firstname and lastname
 * @param {string} fieldName - Name of the field in the backend (e.g., 'signature')
 * @returns {FormData} - FormData object ready for upload
 */
export const createSignatureFormData = (signatureBlob, user, fieldName = 'signature') => {
  const formData = new FormData()
  formData.append('files', signatureBlob, `applicantSignature-${user.firstname}-${user.lastname}.png`)
  formData.append('refId', user.id)
  formData.append('source', 'users-permissions')
  formData.append('ref', 'user')
  formData.append('field', fieldName)
  return formData
}
