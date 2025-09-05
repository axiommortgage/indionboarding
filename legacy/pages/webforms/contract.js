import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import AuthContext from '../../context/authContext'
import { UilFileDownload, UilCheckCircle, UilArrowLeft, UilArrowRight } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import { serializeJson } from '../../helpers/serializeData'
import {
  checkValues,
  updateFormsInContext,
  checkPreviousData,
  checkSignature,
  checkInitials,
  filterCompletedForms,
  setLastFormVisited
} from '../../helpers/savingForms'
import * as htmlToImage from 'html-to-image'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import NextPrevFooter from '../../components/NextPrevFooter'
import Processing from '../../components/Processing'
import loaderPosition from '../../helpers/loaderScrollPosition'
import SignatureCanvas from 'react-signature-canvas'
import { Validation } from '../../helpers/validateFields'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import SecureImage from '../../components/SecureImage'
import SecurePDF from '../../components/SecurePDF'
import getAccessibleUrl from '../../helpers/getAccessibleUrl'

const AsyncPdfViewer = ({ url, width, height }) => {
  const [pdfObjectUrl, setPdfObjectUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPdf = async () => {
      if (!url) {
        setLoading(false)
        setError('No PDF URL provided')
        return
      }

      try {
        // Transform the URL
        const accessibleUrl = getAccessibleUrl(url)

        // Get the JWT token
        const token = Cookies.get('jwt')
        if (!token) {
          throw new Error('Authentication token not found')
        }

        // Fetch the PDF using axios with authorization header
        const response = await axios.get(accessibleUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf'
          },
          responseType: 'blob' // Important: get the response as a blob
        })

        // Create a blob URL from the response data
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
        const objectUrl = URL.createObjectURL(pdfBlob)
        setPdfObjectUrl(objectUrl)
      } catch (err) {
        console.error('Error fetching PDF:', err)
        setError(err.message || 'Failed to load PDF')
      } finally {
        setLoading(false)
      }
    }

    fetchPdf()

    // Clean up the object URL when component unmounts
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl)
      }
    }
  }, [url])

  if (loading) {
    return <div>Loading PDF...</div>
  }

  if (error) {
    return <div>Error loading PDF: {error}</div>
  }

  return (
    <iframe
      width={width}
      height={height}
      title="Contract"
      src={pdfObjectUrl}
      type="application/pdf"
      style={{ border: '1px solid #ccc' }}
    />
  )
}

const ContractAndSchedule = (props) => {
  const { onboarding, employer } = props
  const [formInfo, setFormInfo] = useState(onboarding.contractAndSchedule)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const [iframeWidth, setIframeWidth] = useState(1000)
  const form = useRef(null)
  const applicantSign = useRef()
  const signatureCanvas = useRef()
  const applicantInitials = useRef()
  const initialsCanvas = useRef()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const user = userAuth.userInfo
  const router = useRouter()

  const unlockMessage = () => {
    if (userAuth && userAuth.forms.isLocked) {
      return (
        <div className={style.ax_tip} style={{ background: 'white' }}>
          <h3>
            Your onboarding process has been submited and is now locked. <br></br>If you'd like to update any
            information, please request it to be unlocked by emailing us at <span>onboarding@indimortgage.ca</span>.{' '}
          </h3>
        </div>
      )
    }

    return ''
  }

  const requiredFields = ['brokerName']

  //Check if Signature Exists
  const signature = checkSignature(formInfo.brokerSignature)
  const initials = checkInitials(formInfo.brokerInitials)

  //Form Status and Fields Validation
  const validate = (sig, type) => {
    let validation
    if (type === 'signature') {
      validation = Validation(
        formInfo,
        requiredFields,
        checkSignature(sig).isSaved,
        checkInitials(formInfo.brokerInitials).isSaved
      )
    }

    if (type === 'initials') {
      validation = Validation(
        formInfo,
        requiredFields,
        checkSignature(formInfo.brokerSignature).isSaved,
        checkInitials(sig).isSaved
      )
    }

    if (type === 'all') {
      validation = Validation(formInfo, requiredFields, checkSignature(sig[0]).isSaved, checkInitials(sig[1]).isSaved)
    }

    setFieldsValidation(validation)
    return validation
  }

  const isValid = (fieldId) => {
    if (fieldsValidation && fieldsValidation.length > 0) {
      const isInvalid = fieldsValidation.some((f) => f.id === fieldId)
      return isInvalid ? style.inputDanger : ''
    }
    return ''
  }

  //Current formInfo Object Updater
  const updateFormInfo = (e) => {
    const { name } = e.target
    let { value } = e.target
    if (e.target.type === 'checkbox') {
      value = e.target.checked
    }
    e.target.classList.remove(style.inputDanger)

    if (
      userAuth.forms.isFormSaved === true ||
      userAuth.forms.isFormSaved === undefined ||
      userAuth.forms.isFormSaved === null
    ) {
      setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
    }
    setFormInfo({ ...formInfo, [name]: value })
  }

  //Clearing Signature Canvas
  const clearCanvas = (e) => {
    e.preventDefault()
    const refName = e.target.id
    if (refName === 'applicantSign') {
      applicantSign.current.clear()
    }
    if (refName === 'applicantInitials') {
      applicantInitials.current.clear()
    }
  }

  //Uploading and Saving Signature Image
  const saveSignature = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Generating signature file...' })
    let signatureImg
    const token = await Cookies.get('jwt')

    if (e.target.id !== 'oneClickSign') {
      try {
        const sigType = e.target.id
        let currentCanvas, containerRef

        if (sigType === 'signature') {
          currentCanvas = applicantSign
          containerRef = signatureCanvas
        }

        if (sigType === 'initials') {
          currentCanvas = applicantInitials
          containerRef = initialsCanvas
        }

        // Check if currentCanvas.current exists before trying to access isEmpty()
        if (!currentCanvas.current) {
          throw new Error('Signature component not initialized properly')
        }

        if (currentCanvas.current.isEmpty()) {
          throw new Error('Signature is empty')
        }

        // Use our helper function to capture signature/initials
        const signatureBlob = await captureSignature(currentCanvas, containerRef, htmlToImage)

        // Prepare form data with appropriate field name
        const imageData = createSignatureFormData(
          signatureBlob,
          user,
          sigType === 'signature' ? 'signature' : 'initials'
        )

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving signature...' })
        signatureImg = await axios
          .post(`${apiUrl}/upload`, imageData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((sig) => {
            if (sigType === 'signature') {
              setFormInfo({ ...formInfo, brokerSignature: sig.data[0] })
            }
            if (sigType === 'initials') {
              setFormInfo({ ...formInfo, brokerInitials: sig.data[0] })
            }
            return sig.data[0]
          })
          .catch((err) => {
            throw new Error(`Upload failed: ${err.message}`)
          })

        const isValidated = await validate(signatureImg, sigType)
        const formDate = new Date()
        const brokerName = `${user.firstname}${user.middlename ? ' ' + user.middlename : ''} ${user.lastname}`
        const formsPercentCompletion = await filterCompletedForms(
          userAuth.forms,
          'contractAndSchedule',
          isValidated.length > 0
        )

        // Build form data object
        const formObj = () => {
          const baseObj = {
            completionPercent: formsPercentCompletion,
            isSubmited: false,
            contractAndSchedule: {
              ...formInfo,
              brokerName: brokerName,
              isFormComplete: isValidated.length === 0,
              firstSaveComplete: true,
              brokerSignatureDate: formDate,
              ...(sigType === 'signature' ? { brokerSignature: signatureImg } : { brokerInitials: signatureImg })
            }
          }
          return baseObj
        }

        // Update the form
        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
        const updatedForm = await axios
          .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((res) => res.data)
          .catch((err) => {
            throw new Error(`Form update failed: ${err.message}`)
          })

        setFormInfo({ ...formInfo, ...updatedForm.contractAndSchedule })

        // Update form in Context
        const updatedCtxForm = updateFormsInContext(
          'contractAndSchedule',
          updatedForm.contractAndSchedule,
          updatedForm,
          userAuth
        )
        setUserAuth(updatedCtxForm)

        if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
          router.push('/finished')
        } else {
          setProcessingStatus({ status: 'success', visible: false, message: 'Signature is saved!' })
        }
      } catch (error) {
        setProcessingStatus({
          status: 'error',
          visible: true,
          message: `Error: ${error.message}`
        })
        console.error('Signature save error:', error)
      }
    } else {
      // Handle one-click signing using existing signature
      try {
        signatureImg = user.signature
        const isValidated = validate(signatureImg, 'signature')
        const formDate = new Date()
        const brokerName = `${user.firstname}${user.middlename ? ' ' + user.middlename : ''} ${user.lastname}`
        const formsPercentCompletion = filterCompletedForms(
          userAuth.forms,
          'contractAndSchedule',
          isValidated.length > 0
        )

        const formObj = () => ({
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          contractAndSchedule: {
            ...formInfo,
            brokerName: brokerName,
            isFormComplete: isValidated.length === 0,
            firstSaveComplete: true,
            brokerSignature: signatureImg,
            brokerSignatureDate: formDate
          }
        })

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
        const updatedForm = await axios
          .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((res) => res.data)
          .catch((err) => {
            throw new Error(`Form update failed: ${err.message}`)
          })

        setFormInfo({ ...formInfo, ...updatedForm.contractAndSchedule })

        const updatedCtxForm = updateFormsInContext(
          'contractAndSchedule',
          updatedForm.contractAndSchedule,
          userAuth.forms,
          userAuth
        )
        setUserAuth(updatedCtxForm)

        if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
          router.push('/finished')
        } else {
          setProcessingStatus({ status: 'success', visible: false, message: 'Signature is saved!' })
        }
      } catch (error) {
        setProcessingStatus({
          status: 'error',
          visible: true,
          message: `Error: ${error.message}`
        })
        console.error('One-click sign error:', error)
      }
    }
  }

  //Updating the Form
  const updatecontractAndScheduleForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const isValidated = await validate([formInfo.brokerSignature, formInfo.brokerInitials], 'all')
    const formDate = await new Date()
    const brokerName = await `${user.firstname}${user.middlename ? ' ' + user.middlename : ''} ${user.lastname}`
    const formsPercentCompletion = await filterCompletedForms(
      userAuth.forms,
      'contractAndSchedule',
      isValidated.length > 0
    )

    //Building Onboarding mpcApplication form data
    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          contractAndSchedule: {
            ...formInfo,
            brokerName: brokerName,
            isFormComplete: false,
            firstSaveComplete: true,
            date: formDate
          }
        }
      } else {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          contractAndSchedule: {
            ...formInfo,
            brokerName: brokerName,
            isFormComplete: true,
            firstSaveComplete: true,
            date: formDate
          }
        }
      }
    }

    //Updating the Form
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating onboarding profile...' })

    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), config)
      .then(async (res) => res.data)
      .catch((err) => {
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    setFormInfo({ ...formInfo, ...updatedForm.contractAndSchedule })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext(
      'contractAndSchedule',
      updatedForm.contractAndSchedule,
      userAuth.forms,
      userAuth
    )
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Contract And Schedule form saved!' })
    }
  }

  //Rendering Signature if it is saved
  const showSavedSignature = () => {
    let form = null
    if (userAuth && userAuth.forms) {
      form = userAuth.forms.contractAndSchedule
    }

    if (signature.isSaved) {
      return (
        <>
          <Row className={formstyle.signatures}>
            <Col sm={12} md={6}>
              <div style={{ width: '100%', maxWidth: '400px', display: 'block' }}>
                <SecureImage
                  src={formInfo.brokerSignature.url}
                  alt={formInfo.brokerSignature.name}
                  className={style.img_responsive}
                />
              </div>
              <p style={{ marginTop: '40px', marginBottom: '40px' }}>
                <input
                  type="text"
                  name="brokerName"
                  id="brokerName"
                  className={isValid('brokerName')}
                  onChange={(e) => updateFormInfo(e)}
                  defaultValue={checkPreviousData('contractAndSchedule', 'brokerName', user, onboarding)}
                ></input>
                <span>Broker Name </span>
              </p>
            </Col>
          </Row>
        </>
      )
    } else {
      return (
        <>
          {user && user.signature && user.signature.url && user.signature.url.length > 0 ? (
            <div style={{ margin: '54px 0' }}>
              <h2>One click sign</h2>
              <div className={formstyle.signPreview} style={{ width: '400px', display: 'block' }}>
                <SecureImage
                  src={user.signature.url}
                  alt={user.signature.name || 'Signature'}
                  className={style.img_responsive}
                />
              </div>
              <p style={{ marginTop: '40px', marginBottom: '40px' }}>
                <span>Broker Name: </span>{' '}
                <input
                  type="text"
                  name="brokerName"
                  id="brokerName"
                  defaultValue={`${checkPreviousData('contractAndSchedule', 'firstname', user, onboarding)} ${
                    checkPreviousData('contractAndSchedule', 'middlename', user, onboarding)
                      ? checkPreviousData('contractAndSchedule', 'middlename', user, onboarding)
                      : ''
                  } ${checkPreviousData('contractAndSchedule', 'lastname', user, onboarding)}`}
                  onChange={(e) => updateFormInfo(e)}
                ></input>
              </p>
              <p>Click on the button below to use your signature added previously.</p>
              <Button
                label="Click to Sign and Save"
                color="highlight"
                size="medium"
                id="oneClickSign"
                action={(e) => saveSignature(e)}
                disabled={!!signature.isSaved}
              />
            </div>
          ) : (
            <>
              <div className={style.sigContainer}>
                <div ref={signatureCanvas} className={style.sigCanvas}>
                  <SignatureCanvas
                    ref={applicantSign}
                    id="signature"
                    onEnd={(e) => applicantSign.current.isEmpty()}
                    penColor="black"
                    canvasProps={{ width: 500, height: 200 }}
                  />
                </div>
              </div>
              <p>
                <strong>Broker Signature</strong> (Please sign in the rectangle area).
              </p>
              <p style={{ marginTop: '40px', marginBottom: '40px' }}>
                <span>Broker Name: </span>{' '}
                <input
                  type="text"
                  name="brokerName"
                  id="brokerName"
                  defaultValue={`${checkPreviousData('contractAndSchedule', 'firstname', user, onboarding)} ${
                    checkPreviousData('contractAndSchedule', 'middlename', user, onboarding)
                      ? checkPreviousData('contractAndSchedule', 'middlename', user, onboarding)
                      : ''
                  } ${checkPreviousData('contractAndSchedule', 'lastname', user, onboarding)}`}
                  onChange={(e) => updateFormInfo(e)}
                ></input>
              </p>

              <Row>
                <Col sm={12} md={12}>
                  {!signature.isSaved ? <p style={{ color: 'red' }}>Please save your signature.</p> : ''}
                </Col>
                <Col sm={6} md={12}>
                  <Button
                    align="left"
                    color="highlight"
                    id="applicantSign"
                    action={(e) => clearCanvas(e)}
                    label="Clear"
                    disabled={signature.isSaved ? true : false}
                  />
                  <Button
                    align="left"
                    color="highlight"
                    id="signature"
                    action={(e) => saveSignature(e)}
                    label="Save Signature"
                    disabled={signature.isSaved ? true : false}
                  />
                </Col>
              </Row>
            </>
          )}
          {signature.isSaved ? (
            <h2 style={{ color: 'green' }}>
              <UilCheckCircle size={16} /> Signature Saved! Don't forget to Save or Update your form info.
            </h2>
          ) : (
            ''
          )}
        </>
      )
    }
  }

  //Rendering Signature if it is saved
  const showSavedInitials = () => {
    let form = null
    if (userAuth && userAuth.forms) {
      form = userAuth.forms.contractAndSchedule
    }
    if (initials.isSaved) {
      return (
        <>
          <Row align="end">
            <Col sm={12} md={12}>
              <p>
                <strong>Initials</strong>
              </p>
            </Col>
            <Col sm={12} md={6}>
              <div style={{ width: '100%', maxWidth: '250px', display: 'block' }}>
                <SecureImage
                  src={formInfo.brokerInitials.url}
                  alt={formInfo.brokerInitials.name}
                  className={style.img_responsive}
                />
              </div>
              <p style={{ margin: '32px 0 0 0', borderTop: '1px solid #000' }}>
                {formInfo && formInfo.brokerName
                  ? formInfo.brokerName
                  : user
                  ? `${user.firstname} ${user.middlename} ${user.lastname}`
                  : ''}
              </p>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12}>
              <p style={{ fontSize: '12px', margin: '32px 0 0 0' }}>
                Initials are used to authenticate the pages on the print version of the contract.
              </p>
            </Col>
          </Row>
        </>
      )
    } else {
      return (
        <>
          <div className={style.initialsContainer}>
            <div ref={initialsCanvas} className={style.sigCanvas}>
              <SignatureCanvas
                ref={applicantInitials}
                id="initials"
                onEnd={(e) => applicantInitials.current.isEmpty()}
                penColor="black"
                canvasProps={{ width: 250, height: 200 }}
              />
            </div>
          </div>
          {initials.isSaved ? (
            <h2 style={{ color: 'green' }}>
              <UilCheckCircle size={16} /> Signature Saved! Don't forget to Save or Update your form info.
            </h2>
          ) : (
            ''
          )}
          <p>
            <strong>Broker Initials</strong> (Please sign your Initials in the rectangle area).
          </p>

          <Row align="end">
            <Col sm={12} md={12}>
              {!initials.isSaved ? <p style={{ color: 'red' }}>Please save your initials.</p> : ''}
            </Col>
            <Col sm={6} md={12}>
              <Button
                align="left"
                color="highlight"
                id="applicantInitials"
                action={(e) => clearCanvas(e)}
                label="Clear"
                disabled={initials.isSaved ? true : false}
              />
              <Button
                align="left"
                color="highlight"
                id="initials"
                action={(e) => saveSignature(e)}
                label="Save Initials"
                disabled={initials.isSaved ? true : false}
              />
            </Col>
          </Row>
        </>
      )
    }
  }

  const frameWidth = () => {
    if (typeof window === 'undefined') {
      return 680
    } else {
      const w = window.width

      if (w > 0 && w < 540) {
        return 240
      } else if (w >= 540 && w < 768) {
        return 420
      } else if (w >= 768 && w < 992) {
        return 540
      } else if (w >= 992 && w < 1280) {
        return 600
      } else {
        return 860
      }
    }
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On page load
  useEffect(() => {
    setIframeWidth(frameWidth())
  }, [])

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }

    setUserAuth({ ...userAuth, lastFormVisited: 'contract' })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('contract', onboarding.id, config)
  }, [onboarding])

  useEffect(() => {
    if (fieldsValidation && fieldsValidation.length > 0) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [fieldsValidation])

  useEffect(() => {
    if (userAuth && userAuth.beforeLeave) {
      setBeforeLeave(userAuth.beforeLeave)
    }
  }, [userAuth])

  useEffect(() => {
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'save' && beforeLeave.route) {
      const e = beforeLeave.event
      updatecontractAndScheduleForm(e)
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
      {processingStatus.visible ? (
        <Processing
          processing={processingStatus.visible}
          positionRef={(l) => loaderPosition(l)}
          message={processingStatus.message}
        />
      ) : (
        ''
      )}
      <Container className={formstyle.onboardingForm}>
        <Row>
          <Col sm={12}>
            <Row justify="between" align="end">
              <Col sm={12} md={10}>
                <h1 className={style.ax_page_title}>Contract and Payment Schedule</h1>
                <h2 className={style.ax_page_subtitle} style={!formInfo.isFormComplete ? { color: 'red' } : {}}>
                  Status:{' '}
                  <span style={{ textTransform: 'uppercase' }}>
                    {formInfo.isFormComplete ? 'Complete' : 'Incomplete'}
                  </span>{' '}
                </h2>
                {
                  /*show validation only if First Save is Complete*/
                  fieldsValidation.length > 0 && formInfo.firstSaveComplete === true ? (
                    <section className={style.validation}>
                      <h3>The following fields are Required:</h3>
                      <ul>
                        {fieldsValidation.map((f) => (
                          <li key={f.id}>{f.label}</li>
                        ))}
                      </ul>
                    </section>
                  ) : (
                    ''
                  )
                }
              </Col>
            </Row>

            <form className={style.ax_form} ref={form} style={{ padding: '32px 64px' }}>
              <Row>
                <Col sm={12} md={12}>
                  <div className={formstyle.bodyText}>
                    <div className={style.frame}>
                      <AsyncPdfViewer
                        url={
                          onboarding &&
                          onboarding.contractAndSchedule.contractFile &&
                          onboarding.contractAndSchedule.contractFile.url
                            ? onboarding.contractAndSchedule.contractFile.url
                            : null
                        }
                        width={iframeWidth}
                        height="2800"
                      />
                    </div>

                    <Row
                      justify="between"
                      style={{ marginTop: '40px', marginBottom: '40px' }}
                      className={formstyle.content}
                    >
                      <Col sm={12} md={12}>
                        <p style={{ marginTop: '60px', marginBottom: '60px' }}>
                          IN WITNESS WHEREOF the parties here to have signed and sealed this Agreement as of the date
                          first above written.
                        </p>
                      </Col>
                      <Col sm={12} md={12} lg={6}>
                        {showSavedSignature()}
                        {/* <Row>
                            <Col sm={12} md={6}>
                              <p style={{ display: 'block', marginTop: '60px' }}>
                                <input
                                  type="text"
                                  name="witnessName"
                                  id="witnessName"
                                  defaultValue={checkPreviousData(
                                    'contractAndSchedule',
                                    'witnessName',
                                    user,
                                    onboarding
                                  )}
                                  onChange={(e) => updateFormInfo(e)}
                                ></input>
                              </p>
                              <p>Witness Name</p>
                            </Col>
                          </Row> */}
                      </Col>

                      <Col sm={12} md={12} lg={5}>
                        {showSavedInitials()}
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.contractAndSchedule &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.contractAndSchedule.firstSaveComplete) ||
            (userAuth && userAuth.forms && userAuth.forms.isLocked === false && !userAuth.forms.isFormSaved) ? (
              <Row direction="column">
                <Col sm={12}>
                  <section className={style.ax_section}>
                    <p style={{ float: 'right' }}>
                      {' '}
                      {signature.isSaved && initials.isSaved ? '' : 'Please save your signature and initials first.'}
                    </p>
                  </section>
                </Col>
                <Col sm={12}>
                  <div className={style.ax_field}>
                    <Button
                      id="form"
                      name="generate"
                      action={(e) => updatecontractAndScheduleForm(e)}
                      color="highlight"
                      label={signature.isSaved && initials.isSaved ? 'Update Form' : 'Save Form'}
                      align="right"
                      disabled={signature.isSaved && initials.isSaved ? false : true}
                    />
                  </div>
                </Col>
              </Row>
            ) : (
              unlockMessage()
            )}
          </Col>
        </Row>
        {userAuth &&
        userAuth.forms &&
        userAuth.forms.isFormSaved &&
        userAuth.forms.contractAndSchedule &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.contractAndSchedule.isFormComplete ? (
          <NextPrevFooter />
        ) : (
          ''
        )}
      </Container>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const EMPLOYER_ID = process.env.EMPLOYER_ID

  const tokens = nookies.get(ctx)
  const { jwt, userId, onboardingId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const employerData = await axios
      .get(`${API_URL}/users?id=${EMPLOYER_ID}`, config)
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
        employer: employerData,
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

export default ContractAndSchedule
