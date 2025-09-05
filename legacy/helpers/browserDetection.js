// helpers/browserDetection.js

const getBrowserInfo = () => {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const vendor = window.navigator.vendor

  let browserInfo = {
    browser: 'Unknown',
    version: 'Unknown',
    os: 'Unknown',
    device: 'Desktop',
    userAgent,
    platform,
    vendor,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio
    }
  }

  // Browser detection
  if (userAgent.includes('Firefox/')) {
    browserInfo.browser = 'Firefox'
    browserInfo.version = userAgent.split('Firefox/')[1]
  } else if (userAgent.includes('Chrome/')) {
    if (userAgent.includes('Edg/')) {
      browserInfo.browser = 'Edge'
      browserInfo.version = userAgent.split('Edg/')[1]
    } else if (userAgent.includes('OPR/')) {
      browserInfo.browser = 'Opera'
      browserInfo.version = userAgent.split('OPR/')[1]
    } else {
      browserInfo.browser = 'Chrome'
      browserInfo.version = userAgent.split('Chrome/')[1].split(' ')[0]
    }
  } else if (userAgent.includes('Safari/')) {
    browserInfo.browser = 'Safari'
    browserInfo.version = userAgent.split('Version/')[1]?.split(' ')[0] || 'Unknown'
  }

  // OS detection
  if (userAgent.includes('Windows')) {
    browserInfo.os = 'Windows'
  } else if (userAgent.includes('Mac')) {
    browserInfo.os = 'MacOS'
  } else if (userAgent.includes('Linux')) {
    browserInfo.os = 'Linux'
  } else if (userAgent.includes('Android')) {
    browserInfo.os = 'Android'
  } else if (userAgent.includes('iOS')) {
    browserInfo.os = 'iOS'
  }

  // Device detection
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    browserInfo.device = 'Mobile'
    if (/iPad|Tablet/i.test(userAgent)) {
      browserInfo.device = 'Tablet'
    }
  }

  return browserInfo
}

export const captureSignatureWithBrowserInfo = async (signaturePadRef, containerRef, htmlToImage) => {
  try {
    // Get browser info before attempting signature capture
    const browserInfo = getBrowserInfo()

    // Attempt to capture signature using existing logic
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      throw new Error('Signature is empty')
    }

    let signatureBlob

    // Safari-specific handling
    if (/^((?!chrome|android).)*safari/i.test(browserInfo.userAgent)) {
      const canvas = signaturePadRef.current._canvas
      const dataUrl = canvas.toDataURL('image/png')
      const base64Response = await fetch(dataUrl)
      signatureBlob = await base64Response.blob()
    } else {
      const node = containerRef.current
      signatureBlob = await htmlToImage.toBlob(node)
    }

    // Validate blob
    if (!signatureBlob || signatureBlob.size < 1000) {
      throw new Error('Generated signature appears to be empty or invalid')
    }

    return {
      signatureBlob,
      browserInfo
    }
  } catch (error) {
    console.error('Signature capture error:', error)
    throw error
  }
}

export const createSignatureFormDataWithBrowserInfo = (signatureBlob, user, browserInfo, fieldName = 'signature') => {
  const formData = new FormData()
  formData.append('files', signatureBlob, `applicantSignature-${user.firstname}-${user.lastname}.png`)
  formData.append('refId', user.id)
  formData.append('source', 'users-permissions')
  formData.append('ref', 'user')
  formData.append('field', fieldName)

  // Add browser info metadata
  formData.append('browserInfo', JSON.stringify(browserInfo))

  return formData
}
