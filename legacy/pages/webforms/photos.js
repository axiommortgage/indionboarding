import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { UilUpload, UilSave, UilScenery, UilTimes } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import AuthContext from '../../context/authContext'
import { serializeJson } from '../../helpers/serializeData'
import Layout from '../../components/Layout'
import NextPrevFooter from '../../components/NextPrevFooter'
import { updateFormsInContext, filterCompletedForms, setLastFormVisited } from '../../helpers/savingForms'
import { Validation } from '../../helpers/validateFields'
import Processing from '../../components/Processing'
import Button from '../../components/Button'
import style from '../../styles/Profile.module.scss'
import loaderPosition from '../../helpers/loaderScrollPosition'
import ImageCropper from '../../components/ImageCropper'
import SecureImage from '../../components/SecureImage'

const Photos = (props) => {
  const { user, onboarding } = props
  const [formInfo, setFormInfo] = useState({ ...onboarding.photos, useDefaultPhoto: false })
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [files, setFiles] = useState({})
  const [fileSizeMessage, setFileSizeMessage] = useState({ isVisible: false, message: '' })
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [uploadedPhotos, setUploadedPhotos] = useState({})
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [originalFileName, setOriginalFileName] = useState('')
  const [imageError, setImageError] = useState({ digital: '', print: '' })

  const userDigitalPhoto =
    onboarding && onboarding.photos.photo
      ? `${
          onboarding.photos.photo.formats.small
            ? onboarding.photos.photo.formats.small.url
            : onboarding.photos.photo.url
        }`
      : ''
  const userPrintPhoto =
    onboarding && onboarding.photos.printPhoto
      ? `${
          onboarding.photos.printPhoto.formats.small
            ? onboarding.photos.printPhoto.formats.small.url
            : onboarding.photos.printPhoto.url
        }`
      : ''
  const digitalPhotoUrl = userDigitalPhoto
  const printPhotoUrl = userPrintPhoto
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const digitalPhotoForm = useRef()
  const printPhotoForm = useRef()
  const digitalPhoto = useRef()
  const printPhoto = useRef()
  const userInfo = userAuth.userInfo
  const router = useRouter()
  const selectDigitalFile = useRef()
  const selectPrintFile = useRef()
  const defaultPhoto = `/images/indi-default-photo.jpg`
  const fieldWrapper = useRef()

  const unlockMessage = () => {
    if (userAuth && userAuth.forms.isLocked) {
      return (
        <div className={style.ax_tip} style={{ background: 'white' }}>
          <h3>
            Your onboarding process has been submitted and is now locked. <br />
            If you'd like to update any information, please request it to be unlocked by emailing us at{' '}
            <span>onboarding@indimortgage.ca</span>.
          </h3>
        </div>
      )
    }
    return ''
  }

  const requiredFields = ['photo']

  const validate = async () => {
    // Check if digital photo exists either in formInfo or uploadedPhotos
    const hasDigitalPhoto = (formInfo.photo && formInfo.photo.url) || uploadedPhotos.digital || formInfo.useDefaultPhoto

    // If digital photo exists, return empty array (no validation errors)
    // Otherwise, return an array with the missing field
    const validationErrors = hasDigitalPhoto ? [] : [{ id: 'photo', message: 'Digital photo is required' }]

    setFieldsValidation(validationErrors)
    return validationErrors
  }

  const isValid = (fieldId) => {
    if (fieldsValidation && fieldsValidation.length > 0) {
      const isInvalid = fieldsValidation.some((f) => f.id === fieldId)
      return isInvalid ? style.inputDanger : ''
    }
    return ''
  }

  const updateFormInfo = (e) => {
    let { value, name } = e.target

    if (fieldWrapper.current) {
      fieldWrapper.current.classList.remove(style.inputDanger)
    }

    if (e.target.type === 'checkbox') {
      value = e.target.checked
    }

    if (name === 'useDefaultPhoto') {
      if (
        userAuth.forms.isFormSaved === true ||
        userAuth.forms.isFormSaved === undefined ||
        userAuth.forms.isFormSaved === null
      ) {
        setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
      }

      // Clear digital image error when default photo is selected
      if (value === true) {
        setImageError({ ...imageError, digital: '' })
      }
    }

    setFormInfo({ ...formInfo, [name]: value })
  }

  // Verify image dimensions and DPI
  const verifyImageRequirements = (file, type) => {
    return new Promise((resolve) => {
      // If no file or using default photo, skip verification
      if (!file || (type === 'digital' && formInfo.useDefaultPhoto)) {
        setImageError({ ...imageError, [type]: '' })
        resolve(true)
        return
      }

      const img = new Image()
      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight

        // Check minimum dimensions (500x500 pixels)
        if (width < 500 || height < 500) {
          setImageError({
            ...imageError,
            [type]: `Image must be at least 500x500 pixels. Current size: ${width}x${height} pixels.`
          })
          resolve(false)
          return
        }

        // Clear error if image meets requirements
        setImageError({ ...imageError, [type]: '' })
        resolve(true)
      }

      img.onerror = () => {
        setImageError({
          ...imageError,
          [type]: 'Unable to analyze image. Please ensure it is a valid image file.'
        })
        resolve(false)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleUpdatePhoto = async (e) => {
    e.preventDefault()

    if (e.target.id === 'digital') {
      if (formInfo.useDefaultPhoto) {
        setProcessingStatus({ ...processingStatus, visible: true, message: 'Using default photo...' })
        const buffer = await fetch(defaultPhoto).then((res) => res.arrayBuffer())
        const bytes = await new Uint8Array(buffer)
        const photoFile = await new Blob([bytes], { type: 'image/jpg' })
        await uploadPhoto(photoFile, 'A-logo.jpg', 'digital')
      } else {
        const photoFile = files.digital

        // Check for validation errors before proceeding
        if (imageError.digital) {
          setProcessingStatus({ visible: false })
          return
        }

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Processing photo...' })
        setSelectedImage(URL.createObjectURL(photoFile))
        setOriginalFileName(photoFile.name)
        setShowCropper(true)
        setProcessingStatus({ ...processingStatus, visible: false })
      }
      return
    }

    if (e.target.id === 'print') {
      const photoFile = files.print

      // Check for validation errors before proceeding
      if (imageError.print) {
        setProcessingStatus({ visible: false })
        return
      }

      setProcessingStatus({ ...processingStatus, visible: true, message: 'Uploading Photo...' })
      const ext = photoFile.name.split('.').pop()
      const fileName = `${user.firstname} ${user.lastname}.${ext}`
      await uploadPhoto(photoFile, fileName, 'print')
    }
  }

  const uploadPhoto = async (photoFile, fileName, type) => {
    const token = await Cookies.get('jwt')
    const photoData = new FormData()

    photoData.append('files', photoFile, fileName)
    photoData.append('refId', user.id)
    photoData.append('ref', 'user')
    photoData.append('source', 'users-permissions')
    photoData.append('field', type === 'digital' ? 'photo' : 'printPhoto')

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    if (photoFile.size >= 15 * 1024 * 1024) {
      setProcessingStatus({ visible: false, status: 'error', message: 'The image file size must be 15MB or less.' })
      setFileSizeMessage({
        type,
        isVisible: true,
        message: 'The image file exceeds the maximum size of 15MB.'
      })
      return
    }

    setFileSizeMessage({ isVisible: false })

    try {
      const response = await axios.post(`${apiUrl}/upload`, photoData, config)
      const uploadedPhoto = response.data[0]

      // Get the most appropriate URL for display
      const photoUrl = uploadedPhoto.formats?.small?.url || uploadedPhoto.formats?.thumbnail?.url || uploadedPhoto.url

      // Normalize the URL to fix path duplication
      const normalizedUrl = normalizeImageUrl(photoUrl)

      // Update the uploadedPhotos state with the normalized URL
      setUploadedPhotos((prev) => ({ ...prev, [type]: normalizedUrl }))

      await updateOnboardingProcess(uploadedPhoto, type)

      setProcessingStatus({
        visible: false,
        status: 'success',
        message: 'Upload Complete. Your photo has been saved successfully!'
      })
    } catch (err) {
      setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
      console.error(err)
    }
  }

  const updateOnboardingProcess = async (uploadedPhoto, type) => {
    const token = await Cookies.get('jwt')

    // Only validate if this is a digital photo upload
    let isFormComplete = false
    if (type === 'digital' || formInfo.photo || formInfo.useDefaultPhoto) {
      isFormComplete = true
    }

    const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'photos', !isFormComplete)

    // Create a copy of the current formInfo
    const updatedFormInfo = { ...formInfo }

    // Update the appropriate photo field
    if (type === 'digital') {
      updatedFormInfo.photo = uploadedPhoto
    } else if (type === 'print') {
      updatedFormInfo.printPhoto = uploadedPhoto
    }

    // Update the state with the new form info
    setFormInfo(updatedFormInfo)

    const newFormObj = {
      completionPercent: formsPercentCompletion,
      isSubmited: false,
      photos: {
        ...formInfo,
        [type === 'digital' ? 'photo' : 'printPhoto']: uploadedPhoto,
        firstSaveComplete: true,
        isFormComplete: isFormComplete
      }
    }

    try {
      const response = await axios.put(`${apiUrl}/onboarding-processes/${onboarding.id}`, newFormObj, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setFormInfo({ ...formInfo, ...response.data.photos })

      const updatedCtxForm = updateFormsInContext('photos', response.data.photos, response.data, userAuth)
      setUserAuth(updatedCtxForm)

      if (response.data.completionPercent === 100) {
        router.push('/finished')
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const handleCropComplete = async (croppedImage) => {
    setShowCropper(false)
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Processing cropped image...' })

    try {
      const response = await fetch(croppedImage)
      const blob = await response.blob()
      const file = new File([blob], originalFileName, { type: blob.type })

      await uploadPhoto(file, originalFileName, 'digital')
    } catch (err) {
      console.error(err)
      setProcessingStatus({ ...processingStatus, visible: false, status: 'error', message: 'Error uploading photo.' })
    }
  }

  const closeModal = () => {
    setShowCropper(false)
    setSelectedImage(null)
  }

  const handleSelectFile = (e) => {
    e.preventDefault()
    updateFormInfo(e)
    if (e.target.id === 'print') {
      selectPrintFile.current.click()
    }
    if (e.target.id === 'digital') {
      selectDigitalFile.current.click()
    }
  }

  const handleSelected = async (e) => {
    e.preventDefault()
    let photoFile

    if (e.target.id === 'digital') {
      photoFile = selectDigitalFile.current.files[0]
      if (!photoFile) return

      // Clear previous errors
      setImageError({ ...imageError, digital: '' })
      setFiles({ ...files, digital: photoFile })

      // Immediately verify the image
      await verifyImageRequirements(photoFile, 'digital')
    }

    if (e.target.id === 'print') {
      photoFile = selectPrintFile.current.files[0]
      if (!photoFile) return

      // Clear previous errors
      setImageError({ ...imageError, print: '' })
      setFiles({ ...files, print: photoFile })

      // Immediately verify the image
      await verifyImageRequirements(photoFile, 'print')
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    updateFormInfo(e)

    if (e.dataTransfer.items) {
      for (const item of [...e.dataTransfer.items]) {
        if (item.kind === 'file') {
          const file = item.getAsFile()

          if (e.target.id === 'digital') {
            // Clear previous errors
            setImageError({ ...imageError, digital: '' })
            setFiles({ ...files, digital: file })

            // Immediately verify the image
            await verifyImageRequirements(file, 'digital')
          }

          if (e.target.id === 'print') {
            // Clear previous errors
            setImageError({ ...imageError, print: '' })
            setFiles({ ...files, print: file })

            // Immediately verify the image
            await verifyImageRequirements(file, 'print')
          }
        }
      }
    }
  }

  const showDragzone = () => {
    if (formInfo.useDefaultPhoto) {
      return ''
    } else {
      return (
        <div ref={fieldWrapper} className={`${style.dragzone} ${isValid('photo')}`}>
          <input
            ref={selectDigitalFile}
            type="file"
            name="files"
            id="digital"
            hidden
            onChange={(e) => handleSelected(e)}
          />
          <div
            className={style.dragarea}
            type="file"
            name="files"
            id="digital"
            onDrop={(e) => handleDrop(e)}
            onClick={(e) => handleSelectFile(e)}
            onDragOver={(e) => handleDragOver(e)}
          >
            {files && files.digital && files.digital.name && files.digital.name.length > 0 ? (
              <span>{files.digital.name}</span>
            ) : (
              <span>
                {formInfo && formInfo.photo && formInfo.photo.name
                  ? formInfo.photo.name
                  : 'Drag/drop your file here or click to choose it.'}
              </span>
            )}
          </div>
          <Button
            disabled={
              files && files.digital && files.digital.name && files.digital.name.length && !imageError.digital
                ? false
                : true
            }
            id="digital"
            type="submit"
            action={(e) => handleUpdatePhoto(e)}
            icon={<UilUpload size={16} />}
            iconPos="left"
            label="Upload"
          />
        </div>
      )
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const normalizeImageUrl = (url) => {
    if (!url) return ''

    // Fix duplicated paths like /public/images/public/images/
    if (url.includes('/public/images/public/images/')) {
      return url.replace('/public/images/public/images/', '/public/images/')
    }

    return url
  }

  const showPhoto = (type) => {
    // Check for newly uploaded photos first
    if (uploadedPhotos && uploadedPhotos[type]) {
      const normalizedUrl = normalizeImageUrl(uploadedPhotos[type])
      return (
        <div className={style.ax_photo_container}>
          <img src={normalizedUrl} alt={`${type} photo`} style={{ maxHeight: '250px', width: 'auto' }} />
        </div>
      )
    }

    // Then check for existing photos in formInfo
    if (
      type === 'digital' &&
      formInfo &&
      formInfo.photo &&
      (formInfo.photo.url || (formInfo.photo.formats && formInfo.photo.formats.small))
    ) {
      const photoUrl = formInfo.photo.formats?.small?.url || formInfo.photo.url
      const normalizedUrl = normalizeImageUrl(photoUrl)
      return (
        <div className={style.ax_photo_container}>
          <img
            src={normalizedUrl}
            alt="Digital photo"
            ref={digitalPhoto}
            style={{ maxHeight: '250px', width: 'auto' }}
          />
        </div>
      )
    }

    if (
      type === 'print' &&
      formInfo &&
      formInfo.printPhoto &&
      (formInfo.printPhoto.url || (formInfo.printPhoto.formats && formInfo.printPhoto.formats.small))
    ) {
      const photoUrl = formInfo.printPhoto.formats?.small?.url || formInfo.printPhoto.url
      const normalizedUrl = normalizeImageUrl(photoUrl)
      return (
        <div className={style.ax_photo_container}>
          <img src={normalizedUrl} alt="Print photo" ref={printPhoto} style={{ maxHeight: '250px', width: 'auto' }} />
        </div>
      )
    }

    // Show default photo if user selected that option
    if (type === 'digital' && formInfo && formInfo.useDefaultPhoto) {
      return (
        <div className={style.ax_photo_container}>
          <img
            src={defaultPhoto}
            alt="Default photo"
            ref={digitalPhoto}
            style={{ maxHeight: '250px', width: 'auto' }}
          />
        </div>
      )
    }

    // No photo available
    return (
      <div className={style.ax_photo_container}>
        <UilScenery size={64} />
        <p>No photo</p>
      </div>
    )
  }

  useEffect(() => {
    if (formInfo.firstSaveComplete) {
      validate()
      if (validate().length > 0) {
        window.scroll({ top: 0, left: 0, behavior: 'smooth' })
      }
    }

    if (userAuth && userAuth.beforeLeave) {
      setBeforeLeave(userAuth.beforeLeave)
    }
  }, [userAuth])

  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('photos', onboarding.id, config)
  }, [onboarding])

  useEffect(() => {
    setUserAuth({ ...userAuth, lastFormVisited: 'photos', forms: { ...userAuth.forms, isFormSaved: true } })
  }, [userInfo])

  useEffect(() => {
    if (fieldsValidation && fieldsValidation.length > 0) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [fieldsValidation])

  useEffect(() => {
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'save' && beforeLeave.route) {
      const e = beforeLeave.event
      handleUpdatePhoto(e)
    }
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'leave' && beforeLeave.route) {
      router.push(beforeLeave.route)
      setUserAuth({
        ...userAuth,
        beforeLeave: { ...userAuth.beforeLeave, action: 'stay', route: null, event: null },
        forms: { ...userAuth.forms, isFormSaved: true }
      })
    }
  }, [beforeLeave])

  return (
    <Layout toast={processingStatus}>
      {processingStatus.visible && (
        <Processing
          processing={processingStatus.visible}
          positionRef={(l) => loaderPosition(l)}
          message={processingStatus.message}
        />
      )}
      {showCropper && (
        <div className={style.cropperModal}>
          <div className={style.cropperContent}>
            <button onClick={closeModal} className={style.closeButton}>
              <UilTimes />
            </button>
            <ImageCropper image={selectedImage} onCropComplete={handleCropComplete} />
          </div>
        </div>
      )}
      <Container>
        <Row>
          <Col sm={12}>
            <Row justify="between" align="end">
              <Col sm={12} md={10}>
                <h1 className={style.ax_page_title}>Photos</h1>
                <h2 className={style.ax_page_subtitle} style={!formInfo.isFormComplete ? { color: 'red' } : {}}>
                  Status:{' '}
                  <span style={{ textTransform: 'uppercase' }}>
                    {formInfo.isFormComplete ? 'Complete' : 'Incomplete'}
                  </span>{' '}
                </h2>

                {formInfo.firstSaveComplete === true && fieldsValidation.length > 0 ? (
                  <section className={style.validation}>
                    <h3>The following fields are Required:</h3>
                    <ul>
                      {fieldsValidation.map((f) => (
                        <li key={f.id}>{f.message}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </Col>

              <Col sm={12} md={12}>
                <section className={style.contentBox}>
                  <h3>Please note the following when uploading your photo files:</h3>
                  <ul>
                    <li>
                      Do not upload any files that have been cropped at the head, shoulders or arms. A full upper body
                      or full body photo is recommended.
                    </li>
                    <li>
                      If possible, take your photo with a solid color background and ensure your clothing is not the
                      same color as your chosen background (ie black shirt with a black background is not recommended).
                    </li>
                    <li>
                      Make sure your "print" version of your photo is 300 ppi or greater. The maximum size you can
                      upload is 15MB. Larger photos will not be accepted.
                    </li>
                    <li>Images must be at least 500x500 pixels and have a minimum resolution of 72dpi.</li>
                  </ul>
                </section>
              </Col>

              <Col sm={12} md={12}>
                <h1 className={style.ax_page_title}>Upload Photos</h1>
              </Col>

              <Col sm={12} md={6}>
                <form className={style.ax_form} ref={digitalPhotoForm}>
                  <div className={style.ax_field}>
                    <div className={style.photo}>{showPhoto('digital')}</div>
                    <div className={style.ax_image_options}>
                      <h4>
                        Digital Photo <span style={{ color: 'red' }}>*</span>
                      </h4>
                      <p>
                        <strong>JPG or PNG files only.</strong>
                      </p>
                      {showDragzone()}
                    </div>
                    {imageError.digital && <p style={{ color: 'red', marginTop: '8px' }}>{imageError.digital}</p>}
                    <p style={{ marginTop: '16px', lineHeight: '16px' }}>
                      <span>
                        <input
                          checked={!!(formInfo && formInfo.useDefaultPhoto)}
                          id="useDefaultPhoto"
                          name="useDefaultPhoto"
                          value={!!(formInfo && formInfo.useDefaultPhoto)}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e)}
                          style={{ marginBottom: '4px' }}
                        />
                      </span>{' '}
                      I don't have a photo right now. Please use the default image.
                    </p>
                    {formInfo.useDefaultPhoto && (
                      <Button
                        id="digital"
                        disable={fileSizeMessage.isVisible}
                        type="submit"
                        color="highlight"
                        action={(e) => handleUpdatePhoto(e)}
                        icon={<UilSave size={16} />}
                        iconPos="left"
                        label="Save"
                      />
                    )}
                    {fileSizeMessage.isVisible && fileSizeMessage.type === 'digital' && (
                      <h3 style={{ color: 'red' }}>{fileSizeMessage.message}</h3>
                    )}
                  </div>
                </form>
              </Col>

              <Col sm={12} md={6}>
                <form className={style.ax_form} ref={printPhotoForm}>
                  <div className={style.ax_field}>
                    <div className={style.photo}>{showPhoto('print')}</div>
                    <div className={style.ax_image_options}>
                      <h4>Print Photo</h4>
                      <p>
                        <strong>JPG or PNG files only.</strong>
                      </p>
                      <p>
                        <strong>
                          The print photo must be at least 300 ppi.{' '}
                          <a
                            href="https://www.youtube.com/watch?v=oXxUq1ux9lk"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Learn more.
                          </a>
                        </strong>
                      </p>
                      <p>
                        <strong>The maximum file is 15MB.</strong>
                      </p>

                      <div className={style.dragzone}>
                        <input
                          ref={selectPrintFile}
                          type="file"
                          name="files"
                          id="print"
                          hidden
                          onChange={(e) => handleSelected(e)}
                        />
                        <div
                          className={style.dragarea}
                          type="file"
                          name="files"
                          id="print"
                          onDrop={(e) => handleDrop(e)}
                          onClick={(e) => handleSelectFile(e)}
                          onDragOver={(e) => handleDragOver(e)}
                        >
                          {files && files.print && files.print.name && files.print.name.length > 0 ? (
                            <span>{files.print.name}</span>
                          ) : (
                            <span>
                              {formInfo && formInfo.printPhoto && formInfo.printPhoto.name
                                ? formInfo.printPhoto.name
                                : 'Drag/drop your file here or click to choose it.'}
                            </span>
                          )}
                        </div>
                        <Button
                          disabled={
                            !(
                              files &&
                              files.print &&
                              files.print.name &&
                              files.print.name.length &&
                              !imageError.print
                            ) || fileSizeMessage.isVisible
                          }
                          id="print"
                          type="submit"
                          action={(e) => handleUpdatePhoto(e)}
                          icon={<UilUpload size={16} />}
                          iconPos="left"
                          label="Upload"
                          color="highlight"
                        />
                      </div>
                    </div>
                    {imageError.print && <p style={{ color: 'red', marginTop: '8px' }}>{imageError.print}</p>}
                    {fileSizeMessage.isVisible && fileSizeMessage.type === 'print' && (
                      <h3 style={{ color: 'red' }}>{fileSizeMessage.message}</h3>
                    )}
                  </div>
                </form>
              </Col>
            </Row>
          </Col>
        </Row>
        {userAuth &&
        userAuth.forms &&
        userAuth.forms.isFormSaved &&
        userAuth.forms.photos &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.photos.isFormComplete ? (
          <NextPrevFooter />
        ) : (
          unlockMessage()
        )}
      </Container>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const tokens = nookies.get(ctx)
  const { jwt, userId, onboardingId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const userData = await axios
      .get(`${API_URL}/users?id=${userId}`, config)
      .then((res) => {
        const me = res.data[0]
        const serializedData = serializeJson(me)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    const onboardingData = await axios
      .get(`${API_URL}/onboarding-processes/${onboardingId}`, config)
      .then((res) => {
        const obd = res.data
        const serializedData = serializeJson(obd)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        user: userData,
        onboarding: onboardingData
      }
    }
  }
  return {
    redirect: {
      destination: '/',
      permanent: false
    }
  }
}

export default Photos
