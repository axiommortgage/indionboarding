const encodeBase64Image = async (url) => {
  const encoded = await fetch(url)
    .then((response) => response.blob())
    .then(async (blob) => {
      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const image = await promise
      return image
    })

  return encoded
}

export const base64Image = async (url) => {
  try {
    const img = await encodeBase64Image(url)
    return img
  } catch (err) {
    console.log(err)
    throw err
  }
}
