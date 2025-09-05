/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { UilFileDownload, UilCheckCircle, UilUserCircle, UilMapMarker, UilBalanceScale } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import Moment from 'react-moment'
import * as htmlToImage from 'html-to-image'
import SignatureCanvas from 'react-signature-canvas'
import AuthContext from '../../context/authContext'
import { serializeJson, serializeArray } from '../../helpers/serializeData'
import {
  checkValues,
  updateFormsInContext,
  checkPreviousData,
  checkSignature,
  filterCompletedForms,
  setLastFormVisited
} from '../../helpers/savingForms'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import NextPrevFooter from '../../components/NextPrevFooter'
import AddressSelect from '../../components/AddressSelect'
import { PhoneInput } from '../../components/MaskedInputs'
import { getRawPhone } from '../../helpers/formatPhone'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import FormSectionTitle from '../../components/FormSectionTitle'
import { Validation } from '../../helpers/validateFields'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import SecureImage from '../../components/SecureImage'
import getAccessibleUrl from '../../helpers/getAccessibleUrl'

const MpcApplication = (props) => {
  const { onboarding, branches } = props
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const [formInfo, setFormInfo] = useState(onboarding.mpcApplication)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [files, setFiles] = useState({})
  const [fileSizeMessage, setFileSizeMessage] = useState({ isVisible: false, message: '' })
  const [declarationsTextarea, setDeclarationsTextarea] = useState(false)
  const [judgementActionFile, setJudgementActionFile] = useState(false)
  const [beforeLeave, setBeforeLeave] = useState(null)
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef(null)
  const applicantSign = useRef()
  const signatureCanvas = useRef()
  const addressRef = useRef()
  const cityRef = useRef()
  const provinceRef = useRef()
  const postalCodeRef = useRef()
  const suiteUnitRef = useRef()
  const websiteRef = useRef()
  const uploadFile = useRef()
  const declarationCriminalOffenseWrapper = useRef()
  const declarationFraudWrapper = useRef()
  const declarationBankruptcyWrapper = useRef()
  const declarationLicenseDeniedWrapper = useRef()
  const declarationSuspendedWrapper = useRef()
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

  //Required Fields and and Empty Values Checker
  let requiredFields = [
    'firstname',
    'lastname',
    'workEmail',
    'position',
    'address',
    'city',
    'province',
    'postalCode',
    'workPhone',
    'officeAddress',
    'officeCity',
    'officeProvince',
    'officePostalCode',
    'declarationBankruptcy',
    'declarationCriminalOffense',
    'declarationFraud',
    'declarationLicenseDenied',
    'declarationSuspended'
  ]

  if (declarationsTextarea) {
    if (judgementActionFile) {
      requiredFields = [...requiredFields, 'declarationDetails', 'judgementAction']
    } else {
      requiredFields = [...requiredFields, 'declarationDetails']
    }
  }

  //Check if Signature Exists
  const signature = checkSignature(formInfo.applicantDeclarationSignature)

  //Form Status and Fields Validation
  const validate = async (sig) => {
    const validation = Validation(formInfo, requiredFields, checkSignature(sig).isSaved, null)
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
    let isDeclaration
    e.target.classList.remove(style.inputDanger)

    const declarationInfo = () => {
      const declarationsChecker = (declarationName, declarationType) => {
        if (
          (declarationType === 'yes' && e.target.checked === true) ||
          (declarationType === 'yes' && e.target.checked === 'true')
        ) {
          name = declarationName
          value = 'Yes'
          isDeclaration = true
        }

        if (
          (declarationType === 'yes' && e.target.checked === false) ||
          (declarationType === 'yes' && e.target.checked === 'false')
        ) {
          name = declarationName
          value = ''
          isDeclaration = 'ignore'
        }

        if (
          (declarationType === 'no' && e.target.checked === true) ||
          (declarationType === 'no' && e.target.checked === 'true')
        ) {
          name = declarationName
          value = 'No'
          isDeclaration = true
        }

        if (
          (declarationType === 'no' && e.target.checked === false) ||
          (declarationType === 'no' && e.target.checked === 'false')
        ) {
          name = declarationName
          isDeclaration = 'ignore'
        }
      }

      switch (name) {
        case 'declarationBankruptcyYes':
          declarationBankruptcyWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationBankruptcy', 'yes')
          break
        case 'declarationBankruptcyNo':
          declarationBankruptcyWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationBankruptcy', 'no')
          break
        case 'declarationCriminalOffenseYes':
          declarationCriminalOffenseWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationCriminalOffense', 'yes')
          break
        case 'declarationCriminalOffenseNo':
          declarationCriminalOffenseWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationCriminalOffense', 'no')
          break
        case 'declarationFraudYes':
          declarationFraudWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationFraud', 'yes')
          break
        case 'declarationFraudNo':
          declarationFraudWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationFraud', 'no')
          break
        case 'declarationLicenseDeniedYes':
          declarationLicenseDeniedWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationLicenseDenied', 'yes')
          break
        case 'declarationLicenseDeniedNo':
          declarationLicenseDeniedWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationLicenseDenied', 'no')
          break
        case 'declarationSuspendedYes':
          declarationSuspendedWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationSuspended', 'yes')
          break
        case 'declarationSuspendedNo':
          declarationSuspendedWrapper.current.classList.remove(style.inputDanger)
          declarationsChecker('declarationSuspended', 'no')
          break
        default:
          isDeclaration = false
          return ''
      }

      return { name, value, isDeclaration }
    }

    if (name === 'website' || name === 'officeWebsite') {
      value = formatUrl(e.target.value)
    }

    if (e.target.type === 'tel') {
      value = { masked: value, raw: value.replace(/\D/g, '') }
    }
    if (
      userAuth.forms.isFormSaved === true ||
      userAuth.forms.isFormSaved === undefined ||
      userAuth.forms.isFormSaved === null
    ) {
      setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
    }

    if (isDeclaration !== 'ignore') {
      if (e.target.type === 'checkbox') {
        declarationInfo()

        if (!isDeclaration) {
          value = e.target.checked
        }

        setFormInfo({ ...formInfo, [name]: value })
      } else {
        setFormInfo({ ...formInfo, [name]: value })
      }
    } else {
      if (e.target.type !== 'checkbox') {
        setFormInfo({ ...formInfo, [name]: value })
      }
    }
  }

  //Clearing Signature Canvas
  const clearCanvas = (e) => {
    e.preventDefault()
    applicantSign.current.clear()
  }

  //Uploading and Saving Signature Image
  const saveSignature = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Generating signature file...' })
    let signatureImg
    const token = await Cookies.get('jwt')

    if (e.target.id !== 'oneClickSign') {
      try {
        // Check if applicantSign.current exists before trying to access isEmpty()
        if (!applicantSign.current) {
          throw new Error('Signature component not initialized properly')
        }

        if (applicantSign.current.isEmpty()) {
          throw new Error('Signature is empty')
        }

        // Use helper function to capture signature
        const signatureBlob = await captureSignature(applicantSign, signatureCanvas, htmlToImage)

        // Create form data with helper
        const imageData = createSignatureFormData(signatureBlob, user)

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving signature...' })
        signatureImg = await axios
          .post(`${apiUrl}/upload`, imageData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((sig) => {
            setFormInfo({ ...formInfo, applicantDeclarationSignature: sig.data[0] })
            return sig.data[0]
          })
          .catch((err) => {
            throw new Error(`Upload failed: ${err.message}`)
          })

        const isValidated = await validate(signatureImg)
        const rawPhones = await getRawPhone(formInfo)
        const formsPercentCompletion = await filterCompletedForms(
          userAuth.forms,
          'mpcApplication',
          isValidated.length > 0
        )

        // Handle judgment action file if present
        const uploadFileData = new FormData()
        let uploadFile
        if (files?.judgementAction) {
          uploadFile = files.judgementAction
          uploadFileData.append('files', uploadFile, uploadFile.name)
          uploadFileData.append('field', 'judgementAction')
        }

        if (uploadFile) {
          const fileSize = Math.round(uploadFile.size / 1024)
          if (fileSize >= 15 * 1024) {
            throw new Error('The file exceeds the maximum size of 15MB.')
          }
        }

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Uploading Judgement/Action File...' })

        let uploadedFile = null
        if (files?.judgementAction && uploadFileData) {
          uploadedFile = await axios
            .post(`${apiUrl}/upload`, uploadFileData, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => res.data[0])
            .catch((err) => {
              throw new Error(`File upload failed: ${err.message}`)
            })
        }

        // Build form data object
        const formObj = () => ({
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          mpcApplication: {
            ...formInfo,
            ...rawPhones,
            isFormComplete: isValidated.length === 0,
            firstSaveComplete: true,
            applicantDeclarationSignature: signatureImg,
            judgementAction: uploadedFile
          }
        })

        // Update form
        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
        const updatedForm = await axios
          .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((res) => res.data)
          .catch((err) => {
            throw new Error(`Form update failed: ${err.message}`)
          })

        setFormInfo({ ...formInfo, ...updatedForm.mpcApplication })

        // Update context
        const updatedCtxForm = updateFormsInContext('mpcApplication', updatedForm.mpcApplication, updatedForm, userAuth)
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
        const isValidated = await validate(signatureImg)
        const rawPhones = await getRawPhone(formInfo)
        const formsPercentCompletion = await filterCompletedForms(
          userAuth.forms,
          'mpcApplication',
          isValidated.length > 0
        )

        // Handle judgment action file for one-click signing
        const uploadFileData = new FormData()
        if (files?.judgementAction) {
          const uploadFile = files.judgementAction
          const fileSize = Math.round(uploadFile.size / 1024)

          if (fileSize >= 15 * 1024) {
            throw new Error('The file exceeds the maximum size of 15MB.')
          }

          uploadFileData.append('files', uploadFile, uploadFile.name)
          uploadFileData.append('field', 'judgementAction')
        }

        let uploadedFile = null
        if (files?.judgementAction && uploadFileData) {
          uploadedFile = await axios
            .post(`${apiUrl}/upload`, uploadFileData, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => res.data[0])
            .catch((err) => {
              throw new Error(`File upload failed: ${err.message}`)
            })
        }

        const formObj = () => ({
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          mpcApplication: {
            ...formInfo,
            ...rawPhones,
            isFormComplete: isValidated.length === 0,
            firstSaveComplete: true,
            applicantDeclarationSignature: signatureImg,
            judgementAction: uploadedFile
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

        setFormInfo({ ...formInfo, ...updatedForm.mpcApplication })

        const updatedCtxForm = updateFormsInContext('mpcApplication', updatedForm.mpcApplication, updatedForm, userAuth)
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
  const updateMpcApplicationForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')
    const isValidated = await validate(formInfo.applicantDeclarationSignature)

    //Building Onboarding mpcApplication form data
    const rawPhones = await getRawPhone(formInfo)
    const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'mpcApplication', isValidated.length > 0)

    const uploadFileData = new FormData()
    let uploadFile
    if (files && files.judgementAction) {
      uploadFile = await files.judgementAction
      uploadFileData.append('files', uploadFile, uploadFile.name)
      uploadFileData.append('field', 'judgementAction')
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

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Uploading Judgement/Action File...' })

    let uploadedFile
    if (files && files.judgementAction && uploadFileData) {
      uploadedFile = await axios
        .post(`${apiUrl}/upload`, uploadFileData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((res) => {
          return res.data[0]
        })
        .catch((err) => {
          setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
          console.log(err)
          throw err
        })
    }

    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          mpcApplication: {
            ...formInfo,
            ...rawPhones,
            isFormComplete: false,
            firstSaveComplete: true,
            judgementAction: uploadedFile
          }
        }
      }
      return {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        mpcApplication: {
          ...formInfo,
          ...rawPhones,
          isFormComplete: true,
          firstSaveComplete: true,
          judgementAction: uploadedFile
        }
      }
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating onboarding profile...' })
    //Updating the Form
    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(async (res) => res.data)
      .catch((err) => {
        console.log(err)
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
      })

    setFormInfo({ ...formInfo, ...updatedForm.mpcApplication })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext('mpcApplication', updatedForm.mpcApplication, updatedForm, userAuth)
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'MPC Application form saved!' })
    }
  }

  //Updating address input
  const triggerInput = (inputRef, enteredValue) => {
    const input = inputRef.current
    if (input && input.type === 'select-one') {
      switch (enteredValue) {
        case 'alberta':
          enteredValue = 'Alberta'
          break
        case 'britishcolumbia':
          enteredValue = 'British Columbia'
          break
        case 'manitoba':
          enteredValue = 'Manitoba'
          break
        case 'newbrunswick':
          enteredValue = 'New Brunswick'
          break
        case 'newfoundlandandlabrador':
          enteredValue = 'Newfoundland And Labrador'
          break
        case 'northwestterritories':
          enteredValue = 'Northwest Territories'
          break
        case 'novascotia':
          enteredValue = 'Nova Scotia'
          break
        case 'nunavut':
          enteredValue = 'Nunavut'
          break
        case 'ontario':
          enteredValue = 'Ontario'
          break
        case 'princeedwardisland':
          enteredValue = 'Prince Edward Island'
          break
        case 'quebec':
          enteredValue = 'Quebec'
          break
        case 'saskatchewan':
          enteredValue = 'Saskatchewan'
          break
        case 'yukon':
          enteredValue = 'Yukon'
          break
        default:
          enteredValue = 'Select'
      }
      input.value = enteredValue
      const event = new Event('change', { bubbles: true })
      input.dispatchEvent(event)
    } else {
      if (input && input !== undefined) {
        input.value = enteredValue
        const event = new Event('input', { bubbles: true })
        input.dispatchEvent(event)
      }
    }
  }

  //Setting address from selected city
  const setAddress = (selectedAddress) => {
    const { address, city, province, postalCode } = selectedAddress

    for (let a in selectedAddress) {
      if (a === 'address') {
        triggerInput(addressRef, address)
      }
      if (a === 'city') {
        triggerInput(cityRef, city)
      }
      if (a === 'province') {
        triggerInput(provinceRef, province)
      }
      if (a === 'postalCode') {
        triggerInput(postalCodeRef, postalCode)
      }
      if (a === 'suiteUnit') {
        triggerInput(suiteUnitRef, '')
      }
    }

    triggerInput(websiteRef, 'https://indimortgage.ca')

    setFormInfo({
      ...formInfo,
      officeAddress: address,
      officeCity: city,
      officeProvince: province,
      officePostalCode: postalCode,
      officeWebsite: 'https://indimortgage.ca'
    })
  }

  //Rendering Signature if it is saved
  const showSavedSignature = () => {
    if (signature.isSaved) {
      return (
        <>
          <div style={{ width: '400px', display: 'block' }}>
            <SecureImage
              src={formInfo.applicantDeclarationSignature.url}
              alt={formInfo.applicantDeclarationSignature.name || 'Signature'}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <p>
            <strong>Signed on: </strong>
            <Moment format="LLLL">{formInfo.applicantDeclarationSignature.createdAt || new Date()}</Moment>
          </p>
        </>
      )
    }

    // Update the One Click Sign section if it exists
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
          // Add signature canvas when no signature exists
          <>
            <div className={style.sigContainer}>
              <div ref={signatureCanvas} className={style.sigCanvas}>
                <SignatureCanvas
                  ref={applicantSign}
                  onEnd={(e) => handleSignature(e)}
                  penColor="black"
                  canvasProps={{ width: 500, height: 200 }}
                />
              </div>
            </div>
            <div className={style.sigButtons}>
              <Button label="Clear" color="secondary" size="small" id="applicantSign" action={(e) => clearCanvas(e)} />
              <Button
                label="Save Signature"
                color="highlight"
                size="small"
                id="signature"
                action={(e) => saveSignature(e)}
              />
            </div>
          </>
        )}
      </>
    )
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSelectFile = (e) => {
    e.preventDefault()
    if (e.target.id === 'judgementAction') {
      uploadFile.current.click()
    }
  }

  const handleSelected = async (e) => {
    e.preventDefault()
    setFiles({ ...files, judgementAction: uploadFile.current.files[0] })
    setFormInfo({ ...formInfo, judgementAction: uploadFile.current.files[0] })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.items) {
      ;[...e.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === 'file') {
          const file = item.getAsFile()
          setFiles({ ...files, judgementAction: file })
          setFormInfo({ ...formInfo, judgementAction: file })
        }
      })
    }
  }

  const handleSignature = (e) => {
    const inkAmountArr = applicantSign.current.getSignaturePad()._data
    if (inkAmountArr && inkAmountArr.length > 0) {
      const inkAmount = inkAmountArr.reduce((accumulator, currentValue) => accumulator.concat(currentValue))
      return applicantSign.current.isEmpty()
    }
    return true
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }

    if (
      (formInfo && formInfo.declarationBankruptcy && formInfo.declarationBankruptcy === 'Yes') ||
      (formInfo && formInfo.declarationCriminalOffense && formInfo.declarationCriminalOffense === 'Yes') ||
      (formInfo && formInfo.declarationFraud && formInfo.declarationFraud === 'Yes') ||
      (formInfo && formInfo.declarationLicenseDenied && formInfo.declarationLicenseDenied === 'Yes') ||
      (formInfo && formInfo.declarationSuspended && formInfo.declarationSuspended === 'Yes')
    ) {
      if (formInfo.declarationFraud === 'Yes') {
        setDeclarationsTextarea(true)
        setJudgementActionFile(true)
      } else {
        setDeclarationsTextarea(true)
        setJudgementActionFile(false)
      }
    } else {
      setDeclarationsTextarea(false)
      setJudgementActionFile(false)
    }

    setUserAuth({ ...userAuth, lastFormVisited: 'mpc-application' })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('mpc-application', onboarding.id, config)
  }, [onboarding])

  useEffect(() => {
    if (
      (formInfo && formInfo.declarationBankruptcy && formInfo.declarationBankruptcy === 'Yes') ||
      (formInfo && formInfo.declarationCriminalOffense && formInfo.declarationCriminalOffense === 'Yes') ||
      (formInfo && formInfo.declarationFraud && formInfo.declarationFraud === 'Yes') ||
      (formInfo && formInfo.declarationLicenseDenied && formInfo.declarationLicenseDenied === 'Yes') ||
      (formInfo && formInfo.declarationSuspended && formInfo.declarationSuspended === 'Yes')
    ) {
      if (formInfo.declarationFraud === 'Yes') {
        setDeclarationsTextarea(true)
        setJudgementActionFile(true)
      } else {
        setDeclarationsTextarea(true)
        setJudgementActionFile(false)
      }
    } else {
      setDeclarationsTextarea(false)
      setJudgementActionFile(false)
    }
  }, [
    formInfo.declarationBankruptcy,
    formInfo.declarationCriminalOffense,
    formInfo.declarationFraud,
    formInfo.declarationLicenseDenied,
    formInfo.declarationSuspended
  ])

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
      updateMpcApplicationForm(e)
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
                <h1 className={style.ax_page_title}>MPC Membership Application</h1>
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
              <Col sm={12} md={2} style={{ marginBottom: '16px' }}>
                <Button
                  icon={<UilFileDownload />}
                  disabled={formInfo.isFormComplete ? false : true}
                  align="right"
                  color="highlight"
                  action={() => PdfGenerator('button', 'mpcApplication', null, formInfo)}
                  label="PDF"
                />
              </Col>
            </Row>

            <form className={style.ax_form} ref={form}>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Mortgage Professionals Canada" />
                  <div className={formstyle.content}>
                    <ul>
                      <li>Represents Canada's mortgage industry</li>
                      <li>
                        Supports professional excellence through the Accredited Mortgage Professional (AMP) designation
                      </li>
                      <li>Publishes a variety of industry publications covering in depth newsand information</li>
                      <li>Delivers comprehensive professional development courses</li>
                      <li>Provides timely and relevant industry research</li>
                    </ul>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Member Services" />
                  <div className={formstyle.content}>
                    <h3>Professional Accreditation</h3>
                    <p>
                      Accredited Mortgage Professional (AMP) - Canada's national designation for mortgage professionals,
                      supported by extensive advertising (available to members only).
                    </p>
                    <h3>Client Reach</h3>
                    <p>Connecting members with mortgage consumers through a variety of channels</p>
                    <h3>A voice with Government and Regulators</h3>
                    <p>Representing members' interests and providing updates on relevant and regulatory changes</p>
                    <h3>Errors and Omissions Insurance (E & O)</h3>
                    <p>The premier E & O insurance policy for mortgage brokers</p>
                    <h3>Resources</h3>
                    <p>Providing timely industry statistics, publications and research reports</p>
                    <h3>Benefits Program</h3>
                    <p>Discounts on a variety of products and services</p>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Individual Information" icon={<UilUserCircle size={28} />} />
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="name">
                      First Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      id="firstname"
                      className={isValid('firstname')}
                      placeholder="Name"
                      defaultValue={checkPreviousData('mpcApplication', 'firstname', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="name">Middle Name</label>
                    <input
                      type="text"
                      name="middlename"
                      id="middlename"
                      placeholder="Name"
                      defaultValue={checkPreviousData('mpcApplication', 'middlename', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="name">
                      Last Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      className={isValid('lastname')}
                      id="lastname"
                      placeholder="Last Name"
                      defaultValue={checkPreviousData('mpcApplication', 'lastname', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="preferred">Convesational Name</label>
                    <input
                      type="text"
                      name="preferredName"
                      id="preferredName"
                      placeholder="Conversational Name"
                      defaultValue={checkPreviousData('mpcApplication', 'preferredName', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="website">Your Website</label>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      placeholder="https://yoursite.ca"
                      defaultValue={checkPreviousData('mpcApplication', 'website', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="workEmail">
                      Preferred Email Contact<span>*</span>
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      className={isValid('workEmail')}
                      id="workEmail"
                      placeholder="johndoe@indimortgage.ca"
                      defaultValue={checkPreviousData('mpcApplication', 'workEmail', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="alternateEmail">Alternate Email</label>
                    <input
                      type="email"
                      name="alternateEmail"
                      id="alternateEmail"
                      placeholder="johndoe@indimortgage.ca"
                      defaultValue={checkPreviousData('mpcApplication', 'alternateEmail', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="position">
                      Position <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="position"
                      className={isValid('position')}
                      id="position"
                      placeholder="I.E: Mortgage Broker"
                      defaultValue={checkPreviousData('mpcApplication', 'position', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="address">
                      Mailling Address (Street) <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      className={isValid('address')}
                      id="address"
                      placeholder="223 14 Street NW"
                      defaultValue={checkPreviousData('mpcApplication', 'address', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="suiteUnit">Suite/Unit</label>
                    <input
                      type="text"
                      name="suiteUnit"
                      id="suiteUnit"
                      placeholder="suite/unit"
                      defaultValue={checkPreviousData('mpcApplication', 'suiteUnit', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="city">
                      City <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      className={isValid('city')}
                      id="city"
                      placeholder="Calgary"
                      defaultValue={checkPreviousData('mpcApplication', 'city', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="province">
                      Province <span>*</span>
                    </label>
                    <select
                      name="province"
                      className={isValid('province')}
                      id="province"
                      defaultValue={checkPreviousData('mpcApplication', 'province', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    >
                      <option value="">Select a Province</option>
                      <option value="alberta">Alberta</option>
                      <option value="british Columbia">British Columbia</option>
                      <option value="manitoba">Manitoba</option>
                      <option value="new brunswick">New Brunswick</option>
                      <option value="new foundland and Labrador">New Foundland And Labrador</option>
                      <option value="northwest territories">Northwest Territories</option>
                      <option value="nova scotia">Nova Scotia</option>
                      <option value="nunavut">Nunavut</option>
                      <option value="ontario">Ontario</option>
                      <option value="prince edward island">Prince EdwardIsland</option>
                      <option value="quebec">Quebec</option>
                      <option value="saskatchewan">Saskatchewan</option>
                      <option value="yukon">Yukon</option>
                    </select>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="postalCode">
                      Postal Code <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      className={isValid('postalCode')}
                      id="postalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={checkPreviousData('mpcApplication', 'postalCode', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="workPhone">
                        Preferred Phone Contact <span>*</span>
                      </label>
                      <PhoneInput
                        type="tel"
                        name="workPhone"
                        id="workPhone"
                        className={isValid('workPhone')}
                        placeholder="999-888-7777"
                        defaultValue={checkPreviousData('mpcApplication', 'workPhone', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="cellPhone">Cell Phone</label>
                      <PhoneInput
                        type="tel"
                        name="cellPhone"
                        id="cellPhone"
                        placeholder="999-888-7777"
                        defaultValue={checkPreviousData('mpcApplication', 'cellPhone', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      />
                    </div>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="tollfree">Tollfree Phone</label>
                      <PhoneInput
                        type="tel"
                        name="tollfree"
                        id="tollfree"
                        placeholder=""
                        defaultValue={checkPreviousData('mpcApplication', 'tollfree', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      />
                    </div>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="fax">Fax </label>
                      <PhoneInput
                        type="tel"
                        name="fax"
                        id="fax"
                        placeholder="999-888-7777"
                        defaultValue={checkPreviousData('mpcApplication', 'fax', user, onboarding)}
                        onChange={(e) => updateFormInfo(e)}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle
                    title="Office Location"
                    subtitle="To appear on the Consumer Online Director"
                    icon={<UilMapMarker size={28} />}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <AddressSelect branches={branches} action={(e) => setAddress(e)} />
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officeAddress">
                      Office Address (Street) <span>*</span>
                    </label>
                    <input
                      ref={addressRef}
                      type="text"
                      name="officeAddress"
                      className={isValid('officeAddress')}
                      id="officeAddress"
                      placeholder="223 14 Street NW"
                      defaultValue={checkPreviousData('mpcApplication', 'officeAddress', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officeSuiteUnit">Office Suite/Unit</label>
                    <input
                      ref={suiteUnitRef}
                      type="text"
                      name="officeSuiteUnit"
                      id="officeSuiteUnit"
                      placeholder="office Suite/unit"
                      defaultValue={checkPreviousData('mpcApplication', 'officeSuiteUnit', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officeCity">
                      Office City <span>*</span>
                    </label>
                    <input
                      ref={cityRef}
                      type="text"
                      name="officeCity"
                      className={isValid('officeCity')}
                      id="officeCity"
                      placeholder="Calgary"
                      defaultValue={checkPreviousData('mpcApplication', 'officeCity', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officeProvince">
                      Office Province <span>*</span>
                    </label>
                    <select
                      ref={provinceRef}
                      name="officeProvince"
                      className={isValid('officeProvince')}
                      id="officeProvince"
                      defaultValue={checkPreviousData('mpcApplication', 'officeProvince', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    >
                      <option value="">Select a Province</option>
                      <option value="alberta">Alberta</option>
                      <option value="british Columbia">British Columbia</option>
                      <option value="manitoba">Manitoba</option>
                      <option value="new brunswick">New Brunswick</option>
                      <option value="new foundland and Labrador">New Foundland And Labrador</option>
                      <option value="northwest territories">Northwest Territories</option>
                      <option value="nova scotia">Nova Scotia</option>
                      <option value="nunavut">Nunavut</option>
                      <option value="ontario">Ontario</option>
                      <option value="prince edward island">Prince EdwardIsland</option>
                      <option value="quebec">Quebec</option>
                      <option value="saskatchewan">Saskatchewan</option>
                      <option value="yukon">Yukon</option>
                    </select>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officePostalCode">
                      Office Postal Code <span>*</span>
                    </label>
                    <input
                      ref={postalCodeRef}
                      type="text"
                      name="officePostalCode"
                      className={isValid('officePostalCode')}
                      id="officePostalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={checkPreviousData('mpcApplication', 'officePostalCode', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="officeWebsite">Office Website</label>
                    <input
                      ref={websiteRef}
                      type="text"
                      name="officeWebsite"
                      id="officeWebsite"
                      placeholder="https://officesite.ca"
                      defaultValue={checkPreviousData('mpcApplication', 'officeWebsite', user, onboarding)}
                      onChange={(e) => updateFormInfo(e)}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Declarations" icon={<UilBalanceScale size={28} />} />
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={12}>
                  <h2>
                    Individual Declaration <span style={{ color: 'red' }}>*</span>
                  </h2>

                  <div className={style.ax_field}>
                    <label htmlFor=""></label>
                    <p
                      ref={declarationCriminalOffenseWrapper}
                      className={`${formstyle.checkboxRow} ${isValid('declarationCriminalOffense')}`}
                    >
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationCriminalOffense === 'Yes'}
                          id="declarationCriminalOffenseYes"
                          name="declarationCriminalOffenseYes"
                          value={formInfo && formInfo.declarationCriminalOffenseYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationCriminalOffense === 'No'}
                          id="declarationCriminalOffenseNo"
                          name="declarationCriminalOffenseNo"
                          value={formInfo && formInfo.declarationCriminalOffenseNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                      <span className={style.forceParagraph} style={{ marginLeft: '16px' }}>
                        Have you ever been charged with, convicted of or pardoned of a criminal offence?
                      </span>
                    </p>
                  </div>

                  <div className={style.ax_field}>
                    <label htmlFor=""></label>
                    <p
                      ref={declarationFraudWrapper}
                      className={`${formstyle.checkboxRow} ${isValid('declarationFraud')}`}
                    >
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationFraud === 'Yes'}
                          id="declarationFraudYes"
                          name="declarationFraudYes"
                          value={formInfo && formInfo.declarationFraudYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationFraud === 'No'}
                          id="declarationFraudNo"
                          name="declarationFraudNo"
                          value={formInfo && formInfo.declarationFraudNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                      <span className={style.forceParagraph} style={{ marginLeft: '16px' }}>
                        Are there any civil judgments or actions against you or has judgment ever been entered against
                        you in an action involving fraud? If so, attach a copy of the judgment or action.
                      </span>
                    </p>
                  </div>

                  <div className={style.ax_field}>
                    <label htmlFor=""></label>
                    <p
                      ref={declarationSuspendedWrapper}
                      className={`${formstyle.checkboxRow} ${isValid('declarationSuspended')}`}
                    >
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationSuspended === 'Yes'}
                          id="declarationSuspendedYes"
                          name="declarationSuspendedYes"
                          value={formInfo && formInfo.declarationSuspendedYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationSuspended === 'No'}
                          id="declarationSuspendedNo"
                          name="declarationSuspendedNo"
                          value={formInfo && formInfo.declarationSuspendedNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                      <span className={style.forceParagraph} style={{ marginLeft: '16px' }}>
                        Have you ever been disciplined, suspended or expelled as a member of any professional
                        organization?
                      </span>
                    </p>
                  </div>

                  <div className={style.ax_field}>
                    <label htmlFor=""></label>
                    <p
                      ref={declarationLicenseDeniedWrapper}
                      className={`${formstyle.checkboxRow} ${isValid('declarationLicenseDenied')}`}
                    >
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationLicenseDenied === 'Yes'}
                          id="declarationLicenseDeniedYes"
                          name="declarationLicenseDeniedYes"
                          value={formInfo && formInfo.declarationLicenseDeniedYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationLicenseDenied === 'No'}
                          id="declarationLicenseDeniedNo"
                          name="declarationLicenseDeniedNo"
                          value={formInfo && formInfo.declarationLicenseDeniedNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                      <span className={style.forceParagraph} style={{ marginLeft: '16px' }}>
                        Have you ever been denied a license or permit, or had any license or permit revoked, for failure
                        to meet good character requirements?
                      </span>
                    </p>
                  </div>

                  <div className={style.ax_field}>
                    <label htmlFor=""></label>
                    <p
                      ref={declarationBankruptcyWrapper}
                      className={`${formstyle.checkboxRow} ${isValid('declarationBankruptcy')}`}
                    >
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationBankruptcy === 'Yes'}
                          id="declarationBankruptcyYes"
                          name="declarationBankruptcyYes"
                          value={formInfo && formInfo.declarationBankruptcyYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={formInfo && formInfo.declarationBankruptcy === 'No'}
                          id="declarationBankruptcyNo"
                          name="declarationBankruptcyNo"
                          value={formInfo && formInfo.declarationBankruptcyNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                      <span className={style.forceParagraph} style={{ marginLeft: '16px' }}>
                        Are you currently subject to a petition or assignment in bankruptcy or a proposal to creditors
                        under the Bankruptcy and Insolvency Act, or have you ever been bankrupt or insolvent, under any
                        statute?
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>
              {judgementActionFile ? (
                <Row>
                  <Col sm={12} md={12}>
                    <h3>Please attach a copy of the judgement or action.</h3>
                  </Col>
                  <Col sm={12} md={12}>
                    <div className={style.ax_field}>
                      <div className={style.dragzone}>
                        <input
                          ref={uploadFile}
                          type="file"
                          name="files"
                          id="judgementAction"
                          hidden
                          onChange={(e) => handleSelected(e)}
                        />
                        <div
                          className={style.dragarea}
                          type="file"
                          name="files"
                          id="judgementAction"
                          onDrop={(e) => handleDrop(e)}
                          onClick={(e) => handleSelectFile(e)}
                          onDragOver={(e) => handleDragOver(e)}
                        >
                          {files &&
                          files.judgementAction &&
                          files.judgementAction.name &&
                          files.judgementAction.name.length > 0 ? (
                            <span>{files.judgementAction.name}</span>
                          ) : (
                            <span>
                              {formInfo && formInfo.judgementAction && formInfo.judgementAction.name
                                ? formInfo.judgementAction.name
                                : 'Drag/drop your file here or click to choose it.'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : (
                ''
              )}
              {declarationsTextarea ? (
                <Row>
                  <Col sm={12} md={12}>
                    <h3>If you answered yes to any of the above questions, please provide full details below.</h3>
                  </Col>
                  <Col sm={12} md={12}>
                    <div className={style.ax_field}>
                      <label htmlFor="declarationDetails">
                        Declaration details <span>*</span>
                      </label>
                      <textarea
                        name="declarationDetails"
                        className={isValid('declarationDetails')}
                        id="declarationDetails"
                        defaultValue={
                          user || onboarding
                            ? checkPreviousData('mpcApplication', 'declarationDetails', user, onboarding)
                            : null
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </Col>
                </Row>
              ) : (
                ''
              )}
              <Row style={{ marginTop: '32px' }}>
                <Col>
                  <p>
                    I agree to abide by any best practices or professional standards of Mortgage Professionals Canada
                    that may be in place from time to time. I agree to abide by the Mortgage Professionals Canada
                    Bylaws, including its Code of Ethics (“Code”) set out therein, and the policies of Mortgage
                    Professionals Canada in place from time to time, and acknowledge having received and read a copy of
                    the current Mortgage Professionals Canada Bylaw. I understand and agree that, if accused of a
                    violation of the Code, I will be subject to the Mortgage Professionals Canada ethics process and
                    penalties, which may include publication of my name.
                  </p>
                  <p>
                    I declare that the statements made herein are for the purpose of qualifying as a member of Mortgage
                    Professionals Canada and are true and correct. I understand and acknowledge that the statements made
                    herein are being relied upon by Mortgage Professionals Canada, in its sole discretion, to approve my
                    application for membership in Mortgage Professionals Canada. I hereby authorize Mortgage
                    Professionals Canada to make all inquiries necessary to verify the accuracy of statements made
                    herein and consent to the collection, use and disclosure of any of my personal information that
                    Mortgage Professionals Canada deems relevant in order to approve my application for membership. I
                    authorize my employer to pay the initial membership fee, all applicable renewal membership fees for
                    me and to provide information updates on me to Mortgage Professionals Canada. Mortgage Professionals
                    Canada reserves the right in its sole discretion to require the membership applicant to provide a
                    criminal record check upon written request.
                  </p>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={6}>
                  {showSavedSignature()}
                </Col>
              </Row>
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.mpcApplication &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.mpcApplication.firstSaveComplete) ||
            (userAuth && userAuth.forms && userAuth.forms.isLocked === false && !userAuth.forms.isFormSaved) ? (
              <Row justify="end">
                <Col sm={12} md={4}>
                  <Row direction="column">
                    <Col sm={12}>
                      <section className={style.ax_section}>
                        <p style={{ float: 'right' }}>{signature.isSaved ? '' : 'Please save your signature first.'}</p>
                      </section>
                    </Col>
                    <Col sm={12}>
                      <div className={style.ax_field}>
                        <Button
                          id="form"
                          name="generate"
                          action={(e) => updateMpcApplicationForm(e)}
                          color="highlight"
                          label={
                            onboarding && onboarding.mpcApplication.applicantDeclarationSignature
                              ? 'Update Form'
                              : 'Save Form'
                          }
                          align="right"
                          disabled={signature.isSaved ? false : true}
                        />
                      </div>
                    </Col>
                  </Row>
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
        userAuth.forms.mpcApplication &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.mpcApplication.isFormComplete ? (
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
  const { jwt, onboardingId } = tokens
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

    const branchesData = await axios
      .get(`${API_URL}/branches`, config)
      .then((res) => {
        const brch = res.data
        const serializedData = serializeArray(brch)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        onboarding: onboardingData,
        branches: branchesData
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

export default MpcApplication
