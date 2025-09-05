import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { saveAs } from 'file-saver'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import AuthContext from '../../context/authContext'
import { UilFileDownload, UilCheckCircle, UilMoneyWithdraw } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import { serializeJson } from '../../helpers/serializeData'
import {
  checkValues,
  updateFormsInContext,
  checkPreviousData,
  checkSignature,
  filterCompletedForms,
  setLastFormVisited
} from '../../helpers/savingForms'
import Moment from 'react-moment'
import * as htmlToImage from 'html-to-image'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import NextPrevFooter from '../../components/NextPrevFooter'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import FormSectionTitle from '../../components/FormSectionTitle'
import SignatureCanvas from 'react-signature-canvas'
import { Validation } from '../../helpers/validateFields'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import SwitcherBox from '../../components/SwitcherBox'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import SecureImage from '../../components/SecureImage'

const paymentAuthorization = (props) => {
  const { onboarding, resource } = props
  const [formInfo, setFormInfo] = useState({ ...onboarding.paymentAuthorization, payrollRequired: true })
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [files, setFiles] = useState({})
  const [fileSizeMessage, setFileSizeMessage] = useState({ isVisible: false, message: '' })
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef()
  const payrollRequiredWrapper = useRef()
  const chequingSavingsWrapper = useRef()
  const uploadFile = useRef()
  const applicantSign = useRef()
  const signatureCanvas = useRef()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
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

  const resourceLink = () => {
    const rsc = resource.systemDocuments.filter((r) => {
      if (r.title.toLowerCase() === 'credit card authorization form') {
        return r
      }
    })
    return rsc[0].file.url
  }

  resourceLink()

  let requiredFields

  if (user && user.licensed === false) {
    if (formInfo && formInfo.payrollRequired) {
      if (formInfo && formInfo.companyAccount) {
        requiredFields = [
          'brokerName',
          'bankName',
          'bankAddress',
          'institutionNumber',
          'transitNumber',
          'accountNumber',
          'nameOnAccount',
          'businessNumber',
          'payrollRequired',
          'sin',
          'birthdate',
          'accountType'
        ]

        if (files && !files.articlesOfIncorporation) {
          requiredFields = [...requiredFields, 'articlesOfIncorporation']
        }
      } else {
        requiredFields = [
          'brokerName',
          'bankName',
          'bankAddress',
          'institutionNumber',
          'transitNumber',
          'accountNumber',
          'nameOnAccount',
          'payrollRequired',
          'sin',
          'birthdate',
          'accountType'
        ]
      }
    } else {
      requiredFields = ['payrollRequired']
    }
  } else {
    if (formInfo && formInfo.payrollRequired) {
      if (formInfo && formInfo.companyAccount) {
        requiredFields = [
          'brokerName',
          'bankName',
          'bankAddress',
          'institutionNumber',
          'transitNumber',
          'accountNumber',
          'nameOnAccount',
          'businessNumber',
          'accountType'
        ]

        if (files && !files.articlesOfIncorporation) {
          requiredFields = [...requiredFields, 'articlesOfIncorporation']
        }
      } else {
        requiredFields = [
          'brokerName',
          'bankName',
          'bankAddress',
          'institutionNumber',
          'transitNumber',
          'accountNumber',
          'nameOnAccount',
          'accountType'
        ]
      }
    } else {
      requiredFields = ['payrollRequired']
    }
  }

  //Check if Signature Exists
  const signature = checkSignature(formInfo.signature)

  //Form Status and Fields Validation
  const validate = (sig) => {
    // If payroll is not required, we don't need to validate other fields
    if (formInfo.payrollRequiredNo === true) {
      return []
    }

    // Check if we have a signature
    const hasSignature = sig ? true : signature.isSaved

    // Create a validation object with the required fields
    const validation = Validation(formInfo, requiredFields, hasSignature, null)

    setFieldsValidation(validation)
    return validation
  }

  const validateUnlicensed = async () => {
    const validation = Validation(formInfo, requiredFields, null, null)
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
    let { name } = e.target
    let { value } = e.target
    e.target.classList.remove(style.inputDanger)

    if (e.target.type === 'checkbox') {
      value = e.target.checked

      if (e.target.name === 'savingsAccount') {
        chequingSavingsWrapper.current.classList.remove(style.inputDanger)
        setFormInfo({ ...formInfo, savingsAccount: value, chequingAccount: false, accountType: 'Savings' })
      }

      if (e.target.name === 'companyAccount') {
        setFormInfo({ ...formInfo, companyAccount: value })
      }

      if (e.target.name === 'chequingAccount') {
        chequingSavingsWrapper.current.classList.remove(style.inputDanger)
        setFormInfo({ ...formInfo, savingsAccount: false, chequingAccount: value, accountType: 'Chequing' })
      }

      if (e.target.name === 'creditCardExpenses') {
        setFormInfo({ ...formInfo, creditCardExpenses: value })
      }
    } else {
      setFormInfo({ ...formInfo, [name]: value })
    }

    if (
      userAuth.forms.isFormSaved === true ||
      userAuth.forms.isFormSaved === undefined ||
      userAuth.forms.isFormSaved === null
    ) {
      setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
    }
  }

  //Clearing Signature Canvas
  const clearCanvas = (e) => {
    e.preventDefault()
    applicantSign.current.clear()
  }

  const updatePaymentAuthorizationForm = async (e, hasSignature) => {
    e.preventDefault()

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    let isValidated

    if (user && user.licensed) {
      if (hasSignature && hasSignature.status && hasSignature !== null && hasSignature !== undefined) {
        isValidated = await validate(hasSignature.signature, files)
      } else {
        isValidated = await validate(formInfo.signature, files)
      }
    } else {
      isValidated = await validateUnlicensed()
    }

    const formDate = await new Date()
    const uploadFileData = new FormData()
    let uploadFile
    if (files && files.articlesOfIncorporation) {
      uploadFile = await files.articlesOfIncorporation
      uploadFileData.append('files', uploadFile, uploadFile.name)
      uploadFileData.append('field', 'articlesOfIncorporation')
      uploadFileData.append('refId', user.id)
      uploadFileData.append('ref', 'user')
      uploadFileData.append('source', 'users-permissions')
    }

    if (uploadFile && uploadFile !== undefined) {
      let fileSize = Math.round(uploadFile.size / 1024)

      if (fileSize >= 15 * 1024) {
        setProcessingStatus({ visible: false, status: 'error', message: 'The file size must be 15MB or less.' })
        setFileSizeMessage({
          type: e.target.id,
          isVisible: true,
          message: 'The file exceeds the maximum size of 15MB.'
        })
        return
      } else {
        setFileSizeMessage({ isVisible: false })
      }
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Uploading Articles of Incorporation File...' })

    let uploadedFile
    if (files && files.articlesOfIncorporation && uploadFileData) {
      uploadedFile = await axios
        .post(`${apiUrl}/upload`, uploadFileData, config)
        .then((res) => {
          return res.data[0]
        })
        .catch((err) => {
          setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
          console.log(err)
          throw err
        })
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating onboarding profile...' })
    const formsPercentCompletion = await filterCompletedForms(
      userAuth.forms,
      'paymentAuthorization',
      isValidated.length > 0
    )

    //Building Onboarding paymentAuthorization form data
    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          paymentAuthorization: {
            ...formInfo,
            isFormComplete: false,
            firstSaveComplete: true,
            date: formDate,
            articlesOfIncorporation: uploadedFile
          }
        }
      }

      return {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        paymentAuthorization: {
          ...formInfo,
          isFormComplete: true,
          firstSaveComplete: true,
          date: formDate,
          articlesOfIncorporation: uploadedFile
        }
      }
    }

    const payAuthData = formObj().paymentAuthorization
    let cleanObj

    if (formInfo.birthdate === '' || formInfo.birthdate === null || formInfo.birthdate === undefined) {
      cleanObj = { ...formObj(), paymentAuthorization: { ...payAuthData, birthdate: null } }
    } else {
      cleanObj = formObj()
    }

    //Updating the Form
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, cleanObj, config)
      .then(async (res) => res.data)
      .catch((err) => {
        console.log(err)
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
      })

    setFormInfo({ ...formInfo, ...updatedForm.paymentAuthorization })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext(
      'paymentAuthorization',
      updatedForm.paymentAuthorization,
      updatedForm,
      userAuth
    )
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Payment Authorization form saved!' })
    }
  }

  //Uploading and Saving Signature Image
  const saveSignature = async (e) => {
    e.preventDefault()

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Generating signature file...' })
    let signatureImg
    let updatedForm
    const token = await Cookies.get('jwt')
    const formDate = new Date()

    try {
      // Handle one-click signing differently
      if (e.target.id === 'oneClickSign') {
        // Use existing signature from user profile
        signatureImg = user.signature

        if (!signatureImg || !signatureImg.url) {
          throw new Error('No existing signature found')
        }

        // Skip the canvas check and image generation steps
      } else {
        // Regular signature canvas flow
        // Check if applicantSign.current exists before trying to access isEmpty()
        if (!applicantSign.current) {
          throw new Error('Signature component not initialized properly')
        }

        if (applicantSign.current.isEmpty()) {
          throw new Error('Signature is empty')
        }

        // Use the helper function to capture signature
        const signatureBlob = await captureSignature(applicantSign, signatureCanvas, htmlToImage)

        // Create FormData using helper
        const imageData = createSignatureFormData(signatureBlob, user)

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving signature...' })

        signatureImg = await axios
          .post(`${apiUrl}/upload`, imageData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((sig) => {
            setFormInfo({ ...formInfo, signature: sig.data[0] })
            return sig.data[0]
          })
          .catch((err) => {
            throw new Error(`Upload failed: ${err.message}`)
          })
      }

      // Common code for both paths
      const isValidated = await validate(signatureImg)
      const formsPercentCompletion = await filterCompletedForms(
        userAuth.forms,
        'paymentAuthorization',
        isValidated.length > 0
      )

      const formObj = () => {
        if (isValidated.length > 0) {
          return {
            completionPercent: formsPercentCompletion,
            isSubmited: false,
            paymentAuthorization: {
              ...formInfo,
              isFormComplete: false,
              firstSaveComplete: true,
              signature: signatureImg,
              date: formDate
            }
          }
        }

        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          paymentAuthorization: {
            ...formInfo,
            isFormComplete: true,
            firstSaveComplete: true,
            signature: signatureImg,
            date: formDate
          }
        }
      }

      const newFormObj = formObj()

      setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating form...' })

      updatedForm = await axios
        .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, newFormObj, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(`Form update failed: ${err.message}`)
        })

      setFormInfo({ ...formInfo, ...updatedForm.paymentAuthorization })

      const updatedCtxForm = updateFormsInContext(
        'paymentAuthorization',
        updatedForm.paymentAuthorization,
        updatedForm,
        userAuth
      )
      setUserAuth(updatedCtxForm)

      if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
        router.push('/finished')
      } else {
        setProcessingStatus({ status: 'success', visible: false, message: 'Signature is saved!' })
      }

      if (formInfo?.signature?.url || signatureImg) {
        const hasSignature = {
          status: true,
          signature: updatedForm.paymentAuthorization.signature
        }
        updatePaymentAuthorizationForm(e, hasSignature)
      }
    } catch (error) {
      setProcessingStatus({
        status: 'error',
        visible: true,
        message: `Error: ${error.message}`
      })

      if (applicantSign.current && error.message !== 'No existing signature found') {
        applicantSign.current?.clear()
      }

      console.error('Signature save error:', error)
    }
  }

  //Rendering Signature if it is saved
  const showSavedSignature = () => {
    if (signature.isSaved) {
      return (
        <>
          <div style={{ width: '400px', display: 'block' }}>
            <SecureImage
              src={formInfo.signature.url}
              alt={formInfo.signature.name || 'Signature'}
              className={style.img_responsive}
            />
          </div>
          <p>
            <strong>Signed on: </strong>
            <Moment format="LLLL">{formInfo.signature.createdAt || new Date()}</Moment>
          </p>
        </>
      )
    }

    // If user has a signature in their profile but hasn't signed this form yet
    if (user && user.signature && user.signature.url && user.signature.url.length > 0 && signature.isSaved === false) {
      return (
        <div style={{ margin: '54px 0' }}>
          <h2>One click sign</h2>
          <div className={formstyle.signPreview} style={{ width: '400px', display: 'block' }}>
            <SecureImage
              src={user.signature.url}
              alt={user.signature.name || 'Signature'}
              className={style.img_responsive}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
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
      )
    }

    // If no signature exists, show the canvas
    return (
      <>
        <div className={style.sigContainer}>
          <div ref={signatureCanvas} className={style.sigCanvas}>
            <SignatureCanvas
              ref={applicantSign}
              onEnd={() => applicantSign.current.isEmpty()}
              penColor="black"
              canvasProps={{ width: 500, height: 200 }}
            />
          </div>
        </div>
        <p>
          <strong>Broker Signature</strong> (Please sign in the rectangle area).
        </p>
        <Row>
          <Col sm={12} md={12}>
            {!signature.isSaved ? <p style={{ color: 'red' }}>Please save your signature.</p> : ''}
          </Col>
          <Col sm={6} md={6}>
            <Button
              color="highlight"
              id="applicant"
              action={(e) => clearCanvas(e)}
              label="Clear"
              disabled={!!signature.isSaved}
            />
          </Col>
          <Col sm={6} md={6}>
            <Button
              color="highlight"
              id="applicant"
              action={(e) => saveSignature(e)}
              label="Save Signature"
              disabled={!!signature.isSaved}
            />
          </Col>
        </Row>
        {signature.isSaved ? (
          <h2 style={{ color: 'green' }}>
            <UilCheckCircle size={16} /> Signature Saved!
          </h2>
        ) : (
          ''
        )}
      </>
    )
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSelectFile = (e) => {
    e.preventDefault()
    if (e.target.id === 'articlesOfIncorporation') {
      uploadFile.current.click()
    }
  }

  const handleSelected = async (e) => {
    e.preventDefault()
    setFiles({ ...files, articlesOfIncorporation: uploadFile.current.files[0] })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.items) {
      ;[...e.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile()
          setFiles({ ...files, articlesOfIncorporation: file })
        }
      })
    }
  }

  const zipAndDownload = async (pdfLink) => {
    const { userInfo } = userAuth
    const zip = new JSZip()
    const zipFilename = `credit-card-authorization-form.zip`
    const filename = `Credit-Card-Authorization-Form.pdf`
    let zipped

    JSZipUtils.getBinaryContent(pdfLink, async (err, data) => {
      if (err) {
        throw err // or handle the error
      }
      zip.file(filename, data, { binary: true })

      zipped = await zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, zipFilename)
        return content
      })
    })
  }

  const downloadCreditCardForm = (e) => {
    e.preventDefault()
    zipAndDownload(resourceLink())

    // window.open(resourceLink(), '_blank')
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current

      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }
    setUserAuth({
      ...userAuth,
      lastFormVisited: 'payment-authorization'
    })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('payment-authorization', onboarding.id, config)
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
      updatePaymentAuthorizationForm(e)
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

  const isPayrollRequired = checkPreviousData('paymentAuthorization', 'payrollRequired', user, onboarding)

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
                <h1 className={style.ax_page_title}>Payroll Information</h1>
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
                  <FormSectionTitle title="Payroll" icon={<UilMoneyWithdraw size={28} />} />
                </Col>
              </Row>

              <Row>
                {user && user.licensed === false ? (
                  ''
                ) : (
                  <>
                    <Col sm={12} md={12}>
                      <p>
                        This Payment Authorization form authorizes Indi Mortgage to deduct expenses (owing) directly
                        from your bank account in the event you do not have the available funds in your payroll account
                        for 2 consecutive months.
                      </p>
                      <p>
                        ie. If you do not have active payroll over a 2 month period , the expenses outstanding will be
                        deducted directly from your chequing or savings account.
                      </p>
                      <p>
                        Detailed pay statements outlining expenses can be found by logging into your payroll and
                        selecting Commissions.
                      </p>
                    </Col>

                    <Col sm={12} md={12}>
                      <FormSectionTitle
                        subtitle={
                          <>
                            <p>
                              By signing below you are agreeing to payment of your owed expenses by debit to the account
                              shown.
                            </p>
                          </>
                        }
                      />
                    </Col>
                  </>
                )}

                <Col sm={12} md={12}>
                  <div className={formstyle.content} style={{ paddingTop: '40px' }}>
                    <p>
                      I{' '}
                      <input
                        type="text"
                        name="brokerName"
                        className={isValid('brokerName')}
                        id="brokerName"
                        onChange={(e) => updateFormInfo(e)}
                        placeholder="Account holder name*"
                        defaultValue=""
                      ></input>{' '}
                      authorize Indi Mortgage to charge my bank account as indicated below:
                    </p>

                    <p>
                      <span style={{ width: '250px', display: 'inline-block', marginTop: '40px' }}>
                        <strong>
                          Account Type<span>*</span>:{' '}
                        </strong>
                      </span>
                    </p>
                    <div ref={chequingSavingsWrapper} className={isValid('accountType')}>
                      <p className={formstyle.checkboxRow}>
                        <span className={style.checkbox}>
                          <input
                            id="chequingAccount"
                            name="chequingAccount"
                            type="checkbox"
                            checked={!!(formInfo && formInfo.chequingAccount)}
                            onClick={(e) => updateFormInfo(e)}
                            value={
                              user || onboarding
                                ? checkPreviousData('paymentAuthorization', 'chequingAccount', user, onboarding)
                                : ''
                            }
                          />
                          <label>Chequing Account</label>
                        </span>{' '}
                      </p>

                      <p className={formstyle.checkboxRow}>
                        <span className={style.checkbox}>
                          <input
                            id="savingsAccount"
                            name="savingsAccount"
                            type="checkbox"
                            checked={!!(formInfo && formInfo.savingsAccount)}
                            onClick={(e) => updateFormInfo(e)}
                            value={
                              user || onboarding
                                ? checkPreviousData('paymentAuthorization', 'savingsAccount', user, onboarding)
                                : ''
                            }
                          />
                          <label>Savings Account</label>
                        </span>{' '}
                      </p>
                    </div>

                    <div className={style.ax_field} style={{ marginTop: '32px' }}>
                      <p>
                        <strong>Are you being paid in a company account?</strong>
                      </p>
                      <div className={formstyle.switcherRow}>
                        <SwitcherBox
                          type="checkbox"
                          id="companyAccount"
                          name="companyAccount"
                          checked={!!(formInfo && formInfo.companyAccount)}
                          action={(e) => updateFormInfo(e, null)}
                          value={
                            user || onboarding
                              ? checkPreviousData('mpcApplication', 'companyAccount', user, onboarding)
                              : ''
                          }
                          yesno
                        />
                      </div>

                      {formInfo && formInfo.companyAccount ? (
                        <>
                          <div className={style.ax_field}>
                            <p>
                              Please upload a copy of your articles of incorporation below <span>*</span>:
                            </p>
                            <div className={`${style.dragzone} ${isValid('articlesOfIncorporation')}`}>
                              <input
                                ref={uploadFile}
                                type="file"
                                name="files"
                                id="articlesOfIncorporation"
                                hidden
                                onChange={(e) => handleSelected(e)}
                              />
                              <div
                                className={style.dragarea}
                                type="file"
                                name="files"
                                id="articlesOfIncorporation"
                                onDrop={(e) => handleDrop(e)}
                                onClick={(e) => handleSelectFile(e)}
                                onDragOver={(e) => handleDragOver(e)}
                              >
                                {files &&
                                files.articlesOfIncorporation &&
                                files.articlesOfIncorporation.name &&
                                files.articlesOfIncorporation.name.length > 0 ? (
                                  <span>{files.articlesOfIncorporation.name}</span>
                                ) : (
                                  <span>
                                    {formInfo &&
                                    formInfo.articlesOfIncorporation &&
                                    formInfo.articlesOfIncorporation.name
                                      ? formInfo.articlesOfIncorporation.name
                                      : 'Drag/drop your file here or click to choose it.'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        ''
                      )}
                    </div>

                    {formInfo && formInfo.companyAccount ? (
                      <p style={{ marginTop: '40px' }}>
                        <span style={{ width: '250px', display: 'inline-block' }}>
                          <strong>
                            Full Business Number<span>*</span>:{' '}
                          </strong>
                        </span>
                        <input
                          type="text"
                          name="businessNumber"
                          className={isValid('businessNumber')}
                          id="businessNumber"
                          defaultValue={checkPreviousData('paymentAuthorization', 'businessNumber', user, onboarding)}
                          onChange={(e) => updateFormInfo(e)}
                        ></input>
                      </p>
                    ) : (
                      ''
                    )}

                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Birth Date<span>*</span>:{' '}
                        </strong>
                      </span>
                      <input
                        type="date"
                        name="birthdate"
                        className={isValid('birthdate')}
                        id="birthdate"
                        defaultValue={checkPreviousData('paymentAuthorization', 'birthdate', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>

                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          SIN<span>*</span>:{' '}
                        </strong>
                      </span>
                      <input
                        type="text"
                        name="sin"
                        className={isValid('sin')}
                        id="sin"
                        defaultValue={checkPreviousData('paymentAuthorization', 'sin', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>

                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Name On Account<span>*</span>:{' '}
                        </strong>
                      </span>
                      <input
                        type="text"
                        name="nameOnAccount"
                        className={isValid('nameOnAccount')}
                        id="nameOnAccount"
                        defaultValue={checkPreviousData('paymentAuthorization', 'nameOnAccount', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>
                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Bank Name<span>*</span>:{' '}
                        </strong>
                      </span>{' '}
                      <input
                        type="text"
                        name="bankName"
                        className={isValid('bankName')}
                        id="bankName"
                        defaultValue={checkPreviousData('paymentAuthorization', 'bankName', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>
                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Transit Number<span>*</span>:{' '}
                        </strong>
                      </span>{' '}
                      <input
                        type="text"
                        name="transitNumber"
                        className={isValid('transitNumber')}
                        id="transitNumber"
                        defaultValue={checkPreviousData('paymentAuthorization', 'transitNumber', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>
                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Institution Number<span>*</span>:{' '}
                        </strong>
                      </span>{' '}
                      <input
                        type="text"
                        name="institutionNumber"
                        id="institutionNumber"
                        className={isValid('institutionNumber')}
                        defaultValue={checkPreviousData('paymentAuthorization', 'institutionNumber', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>
                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>
                          Account Number<span>*</span>:{' '}
                        </strong>
                      </span>{' '}
                      <input
                        type="text"
                        name="accountNumber"
                        className={isValid('accountNumber')}
                        id="accountNumber"
                        defaultValue={checkPreviousData('paymentAuthorization', 'accountNumber', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>
                    <p>
                      <span style={{ width: '250px', display: 'inline-block' }}>
                        <strong>Bank Address</strong>
                        <span>*</span>: <br /> <small>(Please include City and Postal Code)</small>
                      </span>{' '}
                      <input
                        type="text"
                        name="bankAddress"
                        id="bankAddress"
                        className={isValid('bankAddress')}
                        defaultValue={checkPreviousData('paymentAuthorization', 'bankAddress', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      ></input>
                    </p>

                    <Row style={{ marginTop: '40px', marginBottom: '40px' }}>
                      <Col sm={12} md={6}>
                        <img
                          className={style.img_responsive}
                          src="../images/payment-info.png"
                          alt="payment information"
                        />
                      </Col>

                      {user && user.licensed === false ? (
                        ''
                      ) : (
                        <Col sm={12}>
                          <div className={style.ax_field} style={{ marginTop: '64px' }}>
                            <p htmlFor="creditCardExpenses">
                              <strong>Should you wish outstanding expenses to be collected via credit card?</strong>
                            </p>

                            <SwitcherBox
                              type="checkbox"
                              id="creditCardExpenses"
                              name="creditCardExpenses"
                              checked={formInfo.creditCardExpenses}
                              action={(e) => updateFormInfo(e, null)}
                              value={
                                user || onboarding
                                  ? checkPreviousData('mpcApplication', 'creditCardExpenses', user, onboarding)
                                  : ''
                              }
                              yesno
                            />
                          </div>
                        </Col>
                      )}
                    </Row>
                    <Row>
                      <Col sm={12}>
                        {formInfo && formInfo.creditCardExpenses ? (
                          <Button
                            color="highlight"
                            label="Download Credit Card Authorization Form"
                            icon={<UilFileDownload size={16} />}
                            iconPos="left"
                            id="creditCardForm"
                            name="creditCardForm"
                            action={(e) => downloadCreditCardForm(e)}
                            align="left"
                          />
                        ) : (
                          ''
                        )}
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: '40px', marginBottom: '40px' }} className={formstyle.content}>
                <Col sm={12} md={6}>
                  {showSavedSignature()}
                </Col>
              </Row>

              {user && user.licensed === false ? (
                ''
              ) : (
                <>
                  <p style={{ marginTop: '40px' }}>
                    I understand that this authorization will remain in effect until I cancel it in writing, and I agree
                    to notify Indi Mortgage in writing of any changes in my account information. Funds owed to Indi
                    Mortgage will remain the responsibility of the above noted signator regardless of employment status.
                    NSF charges of $35 will apply if the funds owed cannot be debited from the account provided. If the
                    funds cannot be taken via authorized debit as set forth above, alternate payment arrangements must
                    be made (in writing). Indi Mortgage maintains the right to withhold the entire amount owing from any
                    future/outstanding commissions payable to the signator.
                  </p>
                  <p>
                    Should you wish outstanding expenses to be collected via credit card, please select yes below and
                    download our credit card authorization form. We will not use this credit card information without
                    prior notification. Your credit card can also be used with your consent for new licensing
                    activities, license renewals or future company events or activities again, with your consent.
                  </p>
                </>
              )}
            </form>

            {user && user.licensed ? (
              <>
                {(userAuth &&
                  userAuth.forms &&
                  userAuth.forms.paymentAuthorization &&
                  userAuth.forms.isLocked === false &&
                  !userAuth.forms.paymentAuthorization.firstSaveComplete) ||
                (userAuth && userAuth.forms && userAuth.forms.isLocked === false && !userAuth.forms.isFormSaved) ? (
                  <Row justify="end">
                    <Col sm={12} md={4}>
                      <Row direction="column">
                        <Col sm={12}>
                          <section className={style.ax_section}>
                            <p style={{ float: 'right' }}>
                              {signature.isSaved
                                ? ''
                                : formInfo.payrollRequiredNo === true
                                ? ''
                                : 'Please save your signature first.'}
                            </p>
                          </section>
                        </Col>
                        <Col sm={12}>
                          <div className={style.ax_field}>
                            <Button
                              id="form"
                              name="generate"
                              action={(e) => updatePaymentAuthorizationForm(e)}
                              color="highlight"
                              label={
                                onboarding && onboarding.paymentAuthorization.signature ? 'Update Form' : 'Save Form'
                              }
                              align="right"
                              disabled={signature.isSaved ? false : formInfo.payrollRequiredNo === true ? false : true}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ) : (
                  unlockMessage()
                )}
              </>
            ) : (
              <Row justify="end">
                <Col sm={12} md={4}>
                  <Row direction="column">
                    <Col sm={12}>
                      <div className={style.ax_field}>
                        <Button
                          id="form"
                          name="generate"
                          action={(e) => updatePaymentAuthorizationForm(e)}
                          color="highlight"
                          label={
                            onboarding && onboarding.paymentAuthorization.firstSaveComplete
                              ? 'Update Form'
                              : 'Save Form'
                          }
                          align="right"
                        />
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
        {userAuth &&
        userAuth.forms &&
        userAuth.forms.isFormSaved &&
        userAuth.forms.paymentAuthorization &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.paymentAuthorization.isFormComplete ? (
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
  const tokens = nookies.get(ctx)
  const { jwt, userId, onboardingId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
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

    const resourceData = await axios
      .get(`${API_URL}/documents`, config)
      .then((res) => {
        const rsc = res.data
        const serializedData = serializeJson(rsc)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        onboarding: onboardingData,
        resource: resourceData
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

export default paymentAuthorization
