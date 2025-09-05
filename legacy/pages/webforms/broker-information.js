/* eslint-disable prefer-destructuring */
import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'

import Moment from 'react-moment'
import {
  UilUserCircle,
  UilMobileVibrate,
  UilMapMarker,
  UilShareAlt,
  UilEditAlt,
  UilCheckCircle,
  UilFacebook,
  UilInstagram,
  UilLinkedin,
  UilYoutube,
  UilHourglass,
  UilBalanceScale // Added icon for Declarations
} from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
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
import SwitcherBox from '../../components/SwitcherBox'
import CurrencyInput from '../../components/CurrencyInput'
import NextPrevFooter from '../../components/NextPrevFooter'
import { PhoneInput, SinInput } from '../../components/MaskedInputs'
import { getRawPhone } from '../../helpers/formatPhone'
import AddressSelect from '../../components/AddressSelect'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import FormSectionTitle from '../../components/FormSectionTitle'
import { Validation } from '../../helpers/validateFields'
import formatUrl from '../../helpers/formatUrl'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import getAccessibleUrl from '../../helpers/getAccessibleUrl'
import SecureImage from '../../components/SecureImage'

const BrokerInformation = (props) => {
  const { onboarding, branches } = props
  const [formInfo, setFormInfo] = useState(onboarding.brokerInfo)
  const [isInked, setIsInked] = useState(null)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [sameAddressWarning, setSameAddressWarning] = useState({ showMessage: false, sameAddress: null })
  // const [languages, setLanguages] = useState()
  const [charCount, setCharCount] = useState({ bio: 0, note: 0 })
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [otherMtgSoftware, setOtherMtgSoftware] = useState(false)
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef(null)
  const applicantSign = useRef()
  const signatureCanvas = useRef()
  const addressRef = useRef()
  const cityRef = useRef()
  const provinceRef = useRef()
  const postalCodeRef = useRef()
  const personalAddressRef = useRef()
  const personalCityRef = useRef()
  const personalProvinceRef = useRef()
  const personalPostalCodeRef = useRef()
  const provinceLicenseNumberRef = useRef()
  // Refs for new Declaration fields
  const declarationRegulatoryReviewWrapper = useRef(null)
  const declarationClientComplaintsWrapper = useRef(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()

  const unlockMessage = () => {
    if (userAuth && userAuth.forms && userAuth.forms.isLocked) {
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
  let requiredFields

  if (formInfo && formInfo.province && formInfo.province.toLowerCase() === 'saskatchewan') {
    requiredFields = [
      'firstname',
      'lastname',
      'position',
      'workEmail',
      'address',
      'city',
      'province',
      'postalCode',
      'personalAddress',
      'personalCity',
      'personalProvince',
      'personalPostalCode',
      'workPhone',
      'birthdate',
      'sin',
      'emergencyContact',
      'emergencyPhone',
      'bio',
      'brokerageLicense'
    ]
    // Only add declaration fields if user is licensed
    if (!(user && user.licensed === false)) {
      requiredFields.push('declarationRegulatoryReview', 'declarationClientComplaints')
    }
  } else {
    requiredFields = [
      'firstname',
      'lastname',
      'position',
      'workEmail',
      'address',
      'city',
      'province',
      'postalCode',
      'personalAddress',
      'personalCity',
      'personalProvince',
      'personalPostalCode',
      'workPhone',
      'birthdate',
      'sin',
      'emergencyContact',
      'emergencyPhone',
      'bio'
    ]
    // Only add declaration fields if user is licensed
    if (!(user && user.licensed === false)) {
      requiredFields.push('declarationRegulatoryReview', 'declarationClientComplaints')
    }
  }

  //Check if Signature Exists
  const signature = checkSignature(formInfo.signature)

  //Form Status and Fields Validation
  const validate = async (sig) => {
    // Dynamically add required fields based on declaration answers
    let currentRequiredFields = [...requiredFields]
    if (formInfo.declarationRegulatoryReview === true) {
      // Check for true
      currentRequiredFields.push('declarationRegulatoryReviewDetails')
    }
    if (formInfo.declarationClientComplaints === true) {
      // Check for true
      currentRequiredFields.push('declarationClientComplaintsDetails')
    }

    const validation = Validation(formInfo, currentRequiredFields, checkSignature(sig).isSaved, null)
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
  const updateFormInfo = (e, type) => {
    e.target.classList.remove(style.inputDanger)

    if (
      type &&
      type !== null &&
      type !== undefined &&
      type !== '' &&
      (type === 'officeAddress' || type === 'personalAddress')
    ) {
      const { name, value } = e.target
      const officeFields = ['address', 'suiteUnit', 'city', 'province', 'postalCode', 'provinceLicenseNumber']
      if (type === 'personalAddress') {
        officeFields.forEach((f) => {
          if (f.toLowerCase() === name.toLowerCase().replace('personal', '')) {
            if (
              formInfo[f] !== undefined &&
              formInfo[f].split(' ').join('').toLowerCase() === value.split(' ').join('').toLowerCase()
            ) {
              if (sameAddressWarning.sameAddress === null) {
                setSameAddressWarning({ showMessage: true, sameAddress: false })
              }
            }
          }
        })
      }
      if (
        userAuth.forms.isFormSaved === true ||
        userAuth.forms.isFormSaved === undefined ||
        userAuth.forms.isFormSaved === null
      ) {
        setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
      }

      setFormInfo({ ...formInfo, [name]: value })
    } else if (type === 'languages') {
      const name = type
      const value = e
      setFormInfo({ ...formInfo, [name]: value })
    } else {
      let { name, value } = e.target
      let isDeclaration = false // Flag for declaration checkboxes

      // --- Start: Declaration Checkbox Logic (Boolean) ---
      if (e.target.type === 'checkbox' && e.target.name.startsWith('declaration')) {
        isDeclaration = true // Mark as a declaration checkbox
        const baseName = e.target.name.replace(/Yes$|No$/, '') // Get base name
        const isYesCheckbox = e.target.name.endsWith('Yes')

        name = baseName // Target the main state variable
        // If 'Yes' is clicked, value is true. If 'No' is clicked, value is false.
        value = isYesCheckbox ? true : false

        // Clear potential validation styles on the wrapper
        if (baseName === 'declarationRegulatoryReview') {
          declarationRegulatoryReviewWrapper.current?.classList.remove(style.inputDanger)
        } else if (baseName === 'declarationClientComplaints') {
          declarationClientComplaintsWrapper.current?.classList.remove(style.inputDanger)
        }
      }
      // --- End: Declaration Checkbox Logic (Boolean) ---

      // --- Start: Handling other input types (URL, Phone, newlyLicensed, Social Toggles etc) ---
      if (!isDeclaration || isDeclaration === 'ignore') {
        // Apply formatting only if it wasn't a declaration checkbox that was handled
        if (
          name === 'website' ||
          name === 'secondaryWebsite' ||
          name === 'appointmentScheduleLink' ||
          name === 'googleReviewsLink' ||
          name === 'facebook' ||
          name === 'instagram' ||
          name === 'linkedin' ||
          name === 'twitter' ||
          name === 'threads' ||
          name === 'pinterest' ||
          name === 'tiktok' ||
          name === 'bluesky' ||
          name === 'youtube'
        ) {
          value = formatUrl(e.target.value)
        }

        if (name === 'mortgageSoftware' && value.toLowerCase() === 'other') {
          setOtherMtgSoftware(true)
        }
        if (name === 'mortgageSoftware' && value.toLowerCase() !== 'other') {
          setOtherMtgSoftware(false)
        }

        // Handle newlyLicensed (existingBroker) checkboxes
        if (e.target.type === 'checkbox') {
          if (
            (e.target.name === 'existingBrokerNo' && e.target.checked === true) ||
            (e.target.name === 'existingBrokerNo' && e.target.checked === 'true')
          ) {
            name = 'newlyLicensed'
            value = true
          } else if (
            (e.target.name === 'existingBrokerYes' && e.target.checked === true) ||
            (e.target.name === 'existingBrokerYes' && e.target.checked === 'true')
          ) {
            name = 'newlyLicensed'
            value = false
          } else if (!e.target.name.startsWith('declaration')) {
            // Handle other regular checkboxes (social media toggles)
            // Use e.target.checked directly if it's not a declaration or newlyLicensed
            value = e.target.checked
          }
        }

        if (e.target.type === 'tel') {
          value = { masked: e.target.value, raw: e.target.value.replace(/\D/g, '') }
        }

        if (e.target.name === 'bio') {
          setCharCount({ ...charCount, bio: e.target.value.length })
        }

        if (e.target.name === 'additionalNotes') {
          setCharCount({ ...charCount, note: e.target.value.length })
        }
      }
      // --- End: Handling other input types ---

      if (
        userAuth.forms.isFormSaved === true ||
        userAuth.forms.isFormSaved === undefined ||
        userAuth.forms.isFormSaved === null
      ) {
        setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
      }

      // --- FINAL STATE UPDATE --- Refactored for clarity
      if (isDeclaration) {
        // Value (true or false) and name (baseName) are already set correctly
        setFormInfo({ ...formInfo, [name]: value })
      } else if (e.target.name === 'existingBrokerYes' || e.target.name === 'existingBrokerNo') {
        // Handle the newlyLicensed change based on the click
        const isNewlyLicensed = e.target.name === 'existingBrokerNo'
        setFormInfo({ ...formInfo, newlyLicensed: isNewlyLicensed })
      } else if (e.target.type === 'checkbox') {
        // Handle other regular checkboxes (social media toggles)
        // Use e.target.name directly as the key and e.target.checked as value
        setFormInfo({ ...formInfo, [e.target.name]: e.target.checked })
      } else {
        // Handle non-checkbox inputs
        // Name and value might have been modified earlier (e.g., URL format, phone object, etc.)
        setFormInfo({ ...formInfo, [name]: value })
      }
      // --- END OF FINAL STATE UPDATE ---
    }
  }

  const sameAddress = (e) => {
    if (e.target.id === 'sameAddressYes') {
      setSameAddressWarning({ showMessage: false, sameAddress: true })
    }

    if (e.target.id === 'sameAddressNo') {
      setSameAddressWarning({ showMessage: false, sameAddress: false })
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

    // For one-click signing, we should handle it differently
    if (e.target.id === 'oneClickSign') {
      try {
        // Use the existing signature from user object
        const signatureImg = user.signature

        if (!signatureImg || !signatureImg.url) {
          throw new Error('No existing signature found')
        }

        // Update formInfo with the existing signature
        setFormInfo({ ...formInfo, signature: signatureImg })

        // Continue with form validation and saving
        const isValidated = await validate(signatureImg)
        const rawPhones = await getRawPhone(formInfo)
        const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'brokerInfo', isValidated.length > 0)

        // Build form data object for saving
        const formObj = () => ({
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          brokerInfo: {
            ...formInfo,
            ...rawPhones,
            isFormComplete: isValidated.length === 0,
            firstSaveComplete: true,
            signature: signatureImg
          }
        })

        // Get token for API request
        const token = await Cookies.get('jwt')

        // Save to database
        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
        const updatedForm = await axios
          .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((res) => res.data)
          .catch((err) => {
            throw new Error(`Form update failed: ${err.message}`)
          })

        // Update local state with saved data
        setFormInfo({ ...formInfo, ...updatedForm.brokerInfo })

        // Update context
        const updatedCtxForm = updateFormsInContext('brokerInfo', updatedForm.brokerInfo, updatedForm, userAuth)
        setUserAuth(updatedCtxForm)

        // Show success message
        setProcessingStatus({ status: 'success', visible: true, message: 'Signature saved successfully!' })

        // Hide message after a delay
        setTimeout(() => {
          setProcessingStatus({ visible: false, status: '', message: '' })
        }, 3000)

        return // Exit early
      } catch (error) {
        setProcessingStatus({ status: 'error', visible: true, message: `Error: ${error.message}` })
        console.error('One-click sign error:', error)

        // Hide error message after a delay
        setTimeout(() => {
          setProcessingStatus({ visible: false, status: '', message: '' })
        }, 3000)

        return
      }
    }

    // Only check the canvas reference for manual signing (not one-click)
    // Check if applicantSign.current exists before trying to access isEmpty()
    if (!applicantSign.current) {
      setProcessingStatus({ status: 'error', visible: true, message: 'Signature component not initialized properly.' })
      return
    }

    if (isInked === false) {
      setProcessingStatus({ status: 'error', visible: true, message: 'Please add a real signature.' })
      applicantSign.current.clear()
      return
    }

    if (applicantSign.current.isEmpty() === false) {
      try {
        // Use our helper function to capture signature
        const signatureBlob = await captureSignature(applicantSign, signatureCanvas, htmlToImage)

        const token = await Cookies.get('jwt')

        // Use our helper function to create form data
        const imageData = createSignatureFormData(signatureBlob, user)

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving signature...' })
        const signatureImg = await axios
          .post(`${apiUrl}/upload`, imageData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((sig) => {
            setFormInfo({ ...formInfo, signature: sig.data[0] })
            return sig.data[0]
          })
          .catch((err) => {
            setProcessingStatus({ status: 'error', visible: false, message: `Error: ${err}` })
            console.log(err)
            throw err
          })

        const isValidated = await validate(signatureImg)
        const rawPhones = await getRawPhone(formInfo)
        const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'brokerInfo', isValidated.length > 0)

        //Building Onboarding BrokerInfo form data
        const formObj = () => {
          if (isValidated.length > 0) {
            return {
              completionPercent: formsPercentCompletion,
              isSubmited: false,
              brokerInfo: {
                ...formInfo,
                ...rawPhones,
                isFormComplete: false,
                firstSaveComplete: true,
                signature: signatureImg
              }
            }
          }
          return {
            completionPercent: formsPercentCompletion,
            isSubmited: false,
            brokerInfo: {
              ...formInfo,
              ...rawPhones,
              isFormComplete: true,
              firstSaveComplete: true,
              signature: signatureImg
            }
          }
        }

        const userObj = formObj().brokerInfo
        const {
          firstSaveComplete,
          id,
          isFormComplete,
          lender1,
          lender1Volume,
          lender2,
          lender2Volume,
          lender3,
          lender3Volume,
          newlyLicensed,
          signature,
          __v,
          _id,
          ...newUserObj
        } = userObj

        const finalUserObj = { ...newUserObj, phone: formObj().brokerInfo.workPhone }

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating User Profile...' })

        //Updating the User
        await axios
          .put(`${apiUrl}/users/${user.id}`, finalUserObj, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((res) => {
            setUserAuth({ ...userAuth, userInfo: res.data })
            return res.data
          })
          .catch((err) => {
            setProcessingStatus({ status: 'error', visible: false, message: `Error: ${err}` })
            console.log(err)
            throw err
          })

        const newFormObj = formObj()

        //Updating the form
        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
        const updatedForm = await axios
          .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, newFormObj, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((res) => res.data)
          .catch((err) => {
            setProcessingStatus({ status: 'error', visible: false, message: `Error: ${err}` })
            console.log(err)
            throw err
          })

        setFormInfo({ ...formInfo, ...updatedForm.brokerInfo })

        //Updating form in Context
        const updatedCtxForm = updateFormsInContext(
          'brokerInfo',
          newFormObj.brokerInfo, // Use locally constructed object
          updatedForm, // Still use updatedForm for completionPercent etc.
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
          visible: false,
          message: `Error saving signature: ${error.message}`
        })
        console.error('Signature save error:', error)
      }
    } else {
      setProcessingStatus({ status: 'error', visible: false, message: 'Signature is Empty' })
    }
  }

  //Updating the Form
  const updateUserAndBrokerInfoForm = async (e) => {
    // return unformatPhone(formInfo)
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating Broker Information' })

    const token = Cookies.get('jwt')
    const isValidated = await validate(formInfo.signature)

    const rawPhones = await getRawPhone(formInfo)

    const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'brokerInfo', isValidated.length > 0)

    //Building Onboarding BrokerInfo form data
    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          brokerInfo: {
            ...formInfo,
            ...rawPhones,
            isFormComplete: false,
            firstSaveComplete: true
          }
        }
      }
      return {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        brokerInfo: {
          ...formInfo,
          ...rawPhones,
          isFormComplete: true,
          firstSaveComplete: true
        }
      }
    }

    const userObj = await formObj().brokerInfo
    const {
      firstSaveComplete,
      id,
      isFormComplete,
      lender1,
      lender1Volume,
      lender2,
      lender2Volume,
      lender3,
      lender3Volume,
      newlyLicensed,
      signature,
      __v,
      _id,
      ...newUserObj
    } = userObj

    const finalUserObj = { ...newUserObj, phone: formObj().brokerInfo.workPhone }

    //Updating the User
    await axios
      .put(`${apiUrl}/users/${user.id}`, finalUserObj, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setUserAuth({ ...userAuth, userInfo: res.data })
        return res.data
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        setProcessingStatus({ status: 'error', visible: false, message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    //Updating the Form
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form...' })
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

    setFormInfo({ ...formInfo, ...updatedForm.brokerInfo })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext(
      'brokerInfo',
      formObj().brokerInfo, // Use locally constructed object
      updatedForm, // Still use updatedForm for completionPercent etc.
      userAuth
    )
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Broker Information form saved!' })
    }
  }

  const handleSignature = (e) => {
    const inkAmountArr = applicantSign.current.getSignaturePad()._data
    const inkAmount = inkAmountArr.reduce((accumulator, currentValue) => accumulator.concat(currentValue))

    if (inkAmount.length < 30) {
      setIsInked(false)
    } else {
      setIsInked(true)
    }
    return applicantSign.current.isEmpty()
  }

  //Updating address input
  const triggerInput = (inputRef, enteredValue) => {
    const input = inputRef.current
    if (input.type === 'select-one') {
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
      input.value = enteredValue
      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    }
  }

  //Setting address from selected city
  const setAddress = (selectedAddress) => {
    for (const a in selectedAddress) {
      if (a === 'address') {
        triggerInput(addressRef, selectedAddress.address)
      }
      if (a === 'city') {
        triggerInput(cityRef, selectedAddress.city)
      }
      if (a === 'province') {
        triggerInput(provinceRef, selectedAddress.province)
      }
      if (a === 'postalCode') {
        triggerInput(postalCodeRef, selectedAddress.postalCode)
      }
      if (a === 'provinceLisenceNumber') {
        triggerInput(provinceLicenseNumberRef, selectedAddress.provinceLicenseNumber)
      }
    }
    setFormInfo({ ...formInfo, ...selectedAddress })
  }

  //Rendering Signature if it is saved
  const showSavedSignature = () => {
    // Fix the condition to safely check for signature properties
    if (signature && (signature.isSaved || (signature.data && signature.data.isSaved))) {
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
            <Moment format="LLLL">{formInfo.signature.updatedAt || formInfo.signature.createdAt || new Date()}</Moment>
          </p>
        </>
      )
    }

    return (
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
    )
  }

  const showMtgAppLinkExample = () => {
    if (formInfo && formInfo.mortgageSoftware) {
      const { mortgageSoftware } = formInfo
      switch (mortgageSoftware.toLowerCase()) {
        case 'finmo':
          return (
            <p>
              <strong>E.g.: https://john-doe.mtg-app.com/</strong>
            </p>
          )
        case 'velocity':
          return (
            <p>
              <strong>E.g.: https://velocity.newton.ca/sso/public.php?sc=56cu4qtonmvn</strong>
            </p>
          )
        case 'expertpro':
          return (
            <p>
              <strong>E.g.: https://getmy.mortgage/johndoe#/quick-application?r=1234</strong>
            </p>
          )
        default:
          return ''
      }
    }
  }

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }

    setUserAuth({ ...userAuth, lastFormVisited: 'broker-information' })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('broker-information', onboarding.id, config)
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
    if (userAuth && userAuth.menuOrder) {
    }
  }, [userAuth])

  useEffect(() => {
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'save' && beforeLeave.route) {
      const e = beforeLeave.event
      updateUserAndBrokerInfoForm(e)
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
              <Col sm={12} md={9} lg={10}>
                <h1 className={style.ax_page_title}>Broker Information</h1>
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

            <form className={style.ax_form} ref={form}>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Personal & Professional" icon={<UilUserCircle size={28} />} />
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="name">
                      First Name <span>*</span>
                    </label>
                    <input
                      className={isValid('firstname')}
                      type="text"
                      name="firstname"
                      id="firstname"
                      placeholder="Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'firstname', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="name">Middle Name</label>
                    <input
                      type="text"
                      className={isValid('middlename')}
                      name="middlename"
                      id="middlename"
                      placeholder="Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'middlename', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
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
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'lastname', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="legalName">Legal Name</label>
                    <input
                      type="text"
                      name="legalName"
                      className={isValid('legalName')}
                      id="legalName"
                      placeholder="Legal Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'legalName', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="preferredName">Preferred Name</label>
                    <input
                      type="text"
                      name="preferredName"
                      className={isValid('preferredName')}
                      id="preferredName"
                      placeholder="Preferred Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'preferredName', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="titles">Titles After Name (e.g. AMP, BCC)</label>
                    <input
                      type="text"
                      name="titles"
                      id="titles"
                      className={isValid('titles')}
                      placeholder="AMP, BCC, BCO"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'titles', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
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
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'position', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="license">License Number</label>
                    <input
                      type="text"
                      name="license"
                      className={isValid('license')}
                      id="license"
                      placeholder="I.E: #AXM003333"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'license', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="birthdate">
                      Birthdate <span>*</span>
                    </label>

                    <input
                      type="date"
                      name="birthdate"
                      id="birthdate"
                      className={isValid('birthdate')}
                      placeholder="223 14 Street NW"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'birthdate', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="phone">
                        SIN <span>*</span>
                      </label>
                      <SinInput
                        type="tel"
                        name="sin"
                        className={isValid('sin')}
                        id="sin"
                        placeholder="999-888-777"
                        defaultValue={
                          user || onboarding ? checkPreviousData('brokerInfo', 'sin', user, onboarding) : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="tshirtSize">T-Shirt Size</label>
                    <select
                      id="tshirtSize"
                      name="tshirtSize"
                      className={isValid('tshirtSize')}
                      onChange={(e) => updateFormInfo(e, null)}
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'tshirtSize', user, onboarding) : ''
                      }
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </Col>
              </Row>

              {/* <Row>
                  <Col sm={12} md={4}>
                    <div className={style.ax_field}>
                      <label htmlFor="languages">
                        Fluent Languages <span>*</span>
                      </label>

                      <TagInput
                        name="languages"
                        id="languages"
                        value={languages}
                        onChange={(e) => handleTagChange(e)}
                        onEnter={validateTag}
                      />

                      
                    </div>
                  </Col>
                </Row> */}

              <Row>
                <Col sm={12} md={6}>
                  <div className={style.ax_field}>
                    <label htmlFor="bio">
                      More About Me (Bio) <span>*</span>
                    </label>
                    <textarea
                      name="bio"
                      className={isValid('bio')}
                      maxLength={800}
                      id="bio"
                      defaultValue={user || onboarding ? checkPreviousData('brokerInfo', 'bio', user, onboarding) : ''}
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                    <div className={style.counter}>
                      <span>{`${charCount.bio}`} </span>
                      <span>/ 800</span>
                    </div>
                  </div>
                </Col>

                <Col sm={12} md={6}>
                  <div className={style.ax_field}>
                    <label htmlFor="additionalNotes">Additional Notes</label>
                    <textarea
                      name="additionalNotes"
                      id="additionalNotes"
                      maxLength={800}
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'additionalNotes', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                    <div className={style.counter}>
                      <span>{`${charCount.note}`} </span>
                      <span>/ 800</span>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Contact" icon={<UilMobileVibrate size={28} />} />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="workEmail">
                      Preferred Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      className={isValid('workEmail')}
                      id="workEmail"
                      placeholder="johndoe@indimortgage.ca"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'workEmail', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div className={style.phoneExt}>
                      <div>
                        <label htmlFor="phone">
                          Preferred Phone Number <span>*</span>
                        </label>
                        <PhoneInput
                          type="tel"
                          name="workPhone"
                          className={isValid('workPhone')}
                          id="workPhone"
                          placeholder="999-888-7777"
                          defaultValue={
                            user || onboarding ? checkPreviousData('brokerInfo', 'workPhone', user, onboarding) : ''
                          }
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                      </div>
                      <div>
                        <label htmlFor="ext">Ext.</label>
                        <input
                          type="tel"
                          name="ext"
                          id="ext"
                          placeholder="123"
                          defaultValue={
                            user || onboarding ? checkPreviousData('brokerInfo', 'ext', user, onboarding) : ''
                          }
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="homePhone">Home Phone</label>
                      <PhoneInput
                        type="tel"
                        name="homePhone"
                        id="homePhone"
                        placeholder="999-888-7777"
                        defaultValue={
                          user || onboarding ? checkPreviousData('brokerInfo', 'homePhone', user, onboarding) : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
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
                        defaultValue={
                          user || onboarding ? checkPreviousData('brokerInfo', 'cellPhone', user, onboarding) : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="emergencyContact">
                        Emergency Contact Name<span>*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        className={isValid('emergencyContact')}
                        id="emergencyContact"
                        placeholder="John Doe"
                        defaultValue={
                          user || onboarding
                            ? checkPreviousData('brokerInfo', 'emergencyContact', user, onboarding)
                            : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="emergencyPhone">
                        Emergency Contact Phone <span>*</span>
                      </label>
                      <PhoneInput
                        type="tel"
                        name="emergencyPhone"
                        className={isValid('emergencyPhone')}
                        id="emergencyPhone"
                        placeholder="999-888-7777"
                        defaultValue={
                          user || onboarding ? checkPreviousData('brokerInfo', 'emergencyPhone', user, onboarding) : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Office Address" icon={<UilMapMarker size={28} />} />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={3}>
                  <AddressSelect branches={branches} action={(e) => setAddress(e)} />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <label htmlFor="address">
                      Office Address (Street) <span>*</span>
                    </label>
                    <input
                      ref={addressRef}
                      type="text"
                      name="address"
                      className={isValid('address')}
                      id="address"
                      placeholder="223 14 Street NW"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'address', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    />
                  </div>
                </Col>
                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="suiteUnit">Suite/Unit</label>
                    <input
                      type="text"
                      name="suiteUnit"
                      id="suiteUnit"
                      placeholder="suite/unit"
                      defaultValue={checkPreviousData('brokerInfo', 'suiteUnit', user, onboarding)}
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    />
                  </div>
                </Col>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <label htmlFor="city">
                      City <span>*</span>
                    </label>
                    <input
                      ref={cityRef}
                      type="text"
                      name="city"
                      className={isValid('city')}
                      id="city"
                      placeholder="Calgary"
                      defaultValue={user || onboarding ? checkPreviousData('brokerInfo', 'city', user, onboarding) : ''}
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    />
                  </div>
                </Col>

                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="province">
                      Province <span>*</span>
                    </label>
                    <select
                      ref={provinceRef}
                      name="province"
                      id="province"
                      className={isValid('province')}
                      placeholder="Alberta"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'province', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    >
                      <option value="">Select a Province</option>
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland And Labrador">New Foundland And Labrador</option>
                      <option value="Northwest Territories">Northwest Territories</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Nunavut">Nunavut</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Yukon">Yukon</option>
                    </select>
                  </div>
                </Col>
                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="postalCode">
                      Postal Code <span>*</span>
                    </label>
                    <input
                      ref={postalCodeRef}
                      type="text"
                      name="postalCode"
                      className={isValid('postalCode')}
                      id="postalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'postalCode', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    />
                  </div>
                </Col>

                {formInfo && formInfo.province && formInfo.province.toLowerCase() === 'saskatchewan' ? (
                  <Col sm={12} md={5}>
                    <div className={style.ax_field}>
                      <label htmlFor="personalAddress">
                        Brokerage License Number <span>*</span>
                      </label>
                      <input
                        ref={personalAddressRef}
                        type="text"
                        name="brokerageLicense"
                        className={isValid('brokerageLicense')}
                        id="brokerageLicense"
                        placeholder=""
                        defaultValue={
                          user || onboarding
                            ? checkPreviousData('brokerInfo', 'brokerageLicense', user, onboarding)
                            : ''
                        }
                        onChange={(e) => updateFormInfo(e, 'brokerageLicense')}
                      />
                    </div>
                  </Col>
                ) : (
                  ''
                )}
              </Row>

              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Personal Address" icon={<UilMapMarker size={28} />} />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <label htmlFor="personalAddress">
                      Address (Street) <span>*</span>
                    </label>
                    <input
                      ref={personalAddressRef}
                      type="text"
                      name="personalAddress"
                      className={isValid('personalAddress')}
                      id="personalAddress"
                      placeholder="223 14 Street NW"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'personalAddress', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    />
                  </div>
                </Col>
                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="suiteUnit">Suite/Unit</label>
                    <input
                      type="text"
                      name="personalSuiteUnit"
                      id="personalSuiteUnit"
                      placeholder="suite/unit"
                      defaultValue={checkPreviousData('brokerInfo', 'personalSuiteUnit', user, onboarding)}
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    />
                  </div>
                </Col>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <label htmlFor="personalCity">
                      City <span>*</span>
                    </label>
                    <input
                      ref={personalCityRef}
                      type="text"
                      name="personalCity"
                      className={isValid('personalCity')}
                      id="personalCity"
                      placeholder="Calgary"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'personalCity', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    />
                  </div>
                </Col>

                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="personalProvince">
                      Province <span>*</span>
                    </label>
                    <select
                      ref={personalProvinceRef}
                      name="personalProvince"
                      className={isValid('personalProvince')}
                      id="personalProvince"
                      placeholder="Alberta"
                      defaultValue={
                        user || onboarding ? checkPreviousData('brokerInfo', 'personalProvince', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    >
                      <option value="">Select a Province</option>
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland And Labrador">New Foundland And Labrador</option>
                      <option value="Northwest Territories">Northwest Territories</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Nunavut">Nunavut</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Yukon">Yukon</option>
                    </select>
                  </div>
                </Col>
                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="personalPostalCode">
                      Postal Code <span>*</span>
                    </label>
                    <input
                      ref={personalPostalCodeRef}
                      type="text"
                      name="personalPostalCode"
                      className={isValid('personalPostalCode')}
                      id="personalPostalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={
                        user || onboarding
                          ? checkPreviousData('brokerInfo', 'personalPostalCode', user, onboarding)
                          : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    />
                  </div>
                </Col>

                {sameAddressWarning && sameAddressWarning.showMessage ? (
                  <Col sm={12} md={12}>
                    <div className={style.ax_field}>
                      <p style={{ color: '#d10606' }}>
                        It seems like you are adding your <strong>Personal Address</strong> as the same as your{' '}
                        <strong>Office Address.</strong>{' '}
                      </p>

                      <div className={style.ax_field}>
                        <label htmlFor="sameAddress">Are you sure about that?</label>
                        <p className={formstyle.checkboxRow}>
                          <span className={style.checkbox}>
                            <input
                              checked={!!false}
                              id="sameAddressYes"
                              name="sameAddressYes"
                              value={!!false}
                              type="checkbox"
                              onChange={(e) => sameAddress(e)}
                            />
                          </span>{' '}
                          Yes, it is the same address.
                        </p>
                        <p className={formstyle.checkboxRow}>
                          <span className={style.checkbox}>
                            <input
                              checked={!!false}
                              id="sameAddressNo"
                              name="sameAddressNo"
                              value={!!false}
                              type="checkbox"
                              onChange={(e) => sameAddress(e)}
                            />
                          </span>{' '}
                          No, I'd like to add a different address.
                        </p>
                      </div>
                    </div>
                  </Col>
                ) : (
                  ''
                )}
              </Row>

              {user && user.licensed === false ? (
                ''
              ) : (
                <>
                  <Row>
                    <Col sm={12} md={12}>
                      <FormSectionTitle title="Brokering Background" icon={<UilHourglass size={28} />} />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12} md={12}>
                      <div className={style.ax_field}>
                        <label htmlFor="bio">Are you an existing agent? (If you are a newly licensed check NO) </label>
                        <p className={formstyle.checkboxRow}>
                          <span className={style.checkbox}>
                            <input
                              checked={!(formInfo && formInfo.newlyLicensed)}
                              id="existingBrokerYes"
                              name="existingBrokerYes"
                              value={!(formInfo && formInfo.newlyLicensed)}
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </span>{' '}
                          Yes
                        </p>
                        <p className={formstyle.checkboxRow}>
                          <span className={style.checkbox}>
                            <input
                              checked={!!(formInfo && formInfo.newlyLicensed)}
                              id="existingBrokerNo"
                              name="existingBrokerNo"
                              value={!!(formInfo && formInfo.newlyLicensed)}
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </span>{' '}
                          No
                        </p>
                      </div>
                    </Col>
                  </Row>

                  {formInfo && !formInfo.newlyLicensed ? (
                    <>
                      <Row>
                        <Col sm={12} md={12}>
                          <h2>What software platform do you use to ingest mortgage applications?</h2>
                        </Col>

                        <Col sm={12} md={3}>
                          <div className={style.ax_field}>
                            <label htmlFor="mortgageSoftware">Software Platform</label>
                          </div>
                          <div className={style.ax_field}>
                            <select
                              id="mortgageSoftware"
                              name="mortgageSoftware"
                              onChange={(e) => updateFormInfo(e, null)}
                              defaultValue={
                                user || onboarding
                                  ? checkPreviousData('brokerInfo', 'mortgageSoftware', user, onboarding)
                                  : ''
                              }
                            >
                              <option value={null}>Select</option>
                              <option value="Expert">Expert</option>
                              <option value="ExpertPro">ExpertPro</option>
                              <option value="Finmo">Finmo</option>
                              <option value="Scarlett">Scarlett</option>
                              <option value="Velocity">Velocity</option>
                              <option value="Other">other</option>
                            </select>
                          </div>
                        </Col>

                        {otherMtgSoftware ? (
                          <Col sm={12} md={3}>
                            <div className={style.ax_field}>
                              <label>Inform the mortgage software you use:</label>
                              <input
                                type="text"
                                name="otherMortgageSoftware"
                                id="otherMortgageSoftware"
                                placeholder="myname.ca"
                                defaultValue={checkPreviousData(
                                  'brokerInfo',
                                  'otherMortgageSoftware',
                                  user,
                                  onboarding
                                )}
                                onChange={(e) => updateFormInfo(e)}
                              />
                            </div>
                          </Col>
                        ) : (
                          ''
                        )}
                      </Row>

                      <Row>
                        <Col sm={12} md={12}>
                          <h2>Please add your top 3 lenders to and each lender volume:</h2>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender1">1st - Lender Name</label>
                            <input
                              type="text"
                              name="lender1"
                              id="lender1"
                              placeholder="Lender"
                              defaultValue={
                                user || onboarding ? checkPreviousData('brokerInfo', 'lender1', user, onboarding) : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                        <Col sm={12} md={3}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender1Volume">Volume</label>
                            <CurrencyInput
                              type="text"
                              name="lender1Volume"
                              id="lender1Volume"
                              placeholder="$"
                              defaultValue={
                                user || onboarding
                                  ? checkPreviousData('brokerInfo', 'lender1Volume', user, onboarding)
                                  : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender2">2nd - Lender Name</label>
                            <input
                              type="text"
                              name="lender2"
                              id="lender2"
                              placeholder="Lender"
                              defaultValue={
                                user || onboarding ? checkPreviousData('brokerInfo', 'lender2', user, onboarding) : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                        <Col sm={12} md={3}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender2Volume">Volume</label>
                            <CurrencyInput
                              type="text"
                              name="lender2Volume"
                              id="lender2Volume"
                              placeholder="$"
                              defaultValue={
                                user || onboarding
                                  ? checkPreviousData('brokerInfo', 'lender2Volume', user, onboarding)
                                  : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender3">3rd - Lender Name</label>
                            <input
                              type="text"
                              name="lender3"
                              id="lender3"
                              placeholder="Lender"
                              defaultValue={
                                user || onboarding ? checkPreviousData('brokerInfo', 'lender3', user, onboarding) : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                        <Col sm={12} md={3}>
                          <div className={style.ax_field}>
                            <label htmlFor="lender3Volume">Volume</label>
                            <CurrencyInput
                              type="text"
                              name="lender3Volume"
                              id="lender3Volume"
                              placeholder="$"
                              defaultValue={
                                user || onboarding
                                  ? checkPreviousData('brokerInfo', 'lender3Volume', user, onboarding)
                                  : ''
                              }
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                          </div>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    ''
                  )}

                  <Row>
                    <Col sm={12} md={12}>
                      <FormSectionTitle title="Social Media" icon={<UilShareAlt size={28} />} />
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <h2>
                        Are you marketing mortgages in social media? Please add below the links and handles of your
                        pages:
                      </h2>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasFacebook"
                        name="hasFacebook"
                        checked={!!(formInfo && formInfo.hasFacebook)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasFacebook', user, onboarding) : ''
                        }
                        yesno
                        label="Facebook"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasFacebook ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              <UilFacebook size={24} />
                              <input
                                type="text"
                                name="facebook"
                                id="facebook"
                                placeholder="I.E: https://facebook.com/jane-doe"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'facebook', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              <UilFacebook size={24} />
                              <input
                                type="text"
                                name="facebookHandler"
                                id="facebooHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'facebookHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>

                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasInstagram"
                        name="hasInstagram"
                        checked={!!(formInfo && formInfo.hasInstagram)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasInstagram', user, onboarding) : ''
                        }
                        yesno
                        label="Instagram"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasInstagram ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              <UilInstagram size={24} />
                              <input
                                type="text"
                                name="instagram"
                                id="instagram"
                                placeholder="I.E: https://instagram.com/jane-doe"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'instagram', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              <UilInstagram size={24} />
                              <input
                                type="text"
                                name="instagramHandler"
                                id="instagramHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'instagramHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasLinkedin"
                        name="hasLinkedin"
                        checked={!!(formInfo && formInfo.hasLinkedin)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasLinkedin', user, onboarding) : ''
                        }
                        yesno
                        label="Linkedin"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasLinkedin ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              <UilLinkedin size={24} />
                              <input
                                type="text"
                                name="linkedin"
                                id="linkedin"
                                placeholder="I.E: https://linkedin.com/in/jane-doe"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'linkedin', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              <UilLinkedin size={24} />
                              <input
                                type="text"
                                name="linkedinHandler"
                                id="linkedinHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'linkedinHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>

                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasTwitter"
                        name="hasTwitter"
                        checked={!!(formInfo && formInfo.hasTwitter)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasTwitter', user, onboarding) : ''
                        }
                        yesno
                        label="X (formerly Twitter)"
                        labelPos="top"
                      />
                    </Col>

                    {formInfo && formInfo.hasTwitter ? (
                      <>
                        <Col sm={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              <img src="/images/x-icon.svg" alt="icon X (twitter)" />
                              <input
                                type="text"
                                name="twitter"
                                id="twitter"
                                placeholder="I.E: https://twitter.com/jane-doe"
                                defaultValue={
                                  user || onboarding ? checkPreviousData('brokerInfo', 'twitter', user, onboarding) : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              <img src="/images/x-icon.svg" alt="icon X (twitter)" />

                              <input
                                type="text"
                                name="twitterHandler"
                                id="twitterHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'twitterHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasYoutube"
                        name="hasYoutube"
                        checked={!!(formInfo && formInfo.hasYoutube)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasYoutube', user, onboarding) : ''
                        }
                        yesno
                        label="Youtube"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasYoutube ? (
                      <>
                        <Col sm={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              <UilYoutube size={24} />
                              <input
                                type="text"
                                name="youtube"
                                id="youtube"
                                placeholder="I.E: https://youtube.com/c/jane-doe"
                                defaultValue={
                                  user || onboarding ? checkPreviousData('brokerInfo', 'youtube', user, onboarding) : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              <UilYoutube size={24} />
                              <input
                                type="text"
                                name="youtubeHandler"
                                id="youtubeHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'youtubeHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>

                  {/* --- START: TIKTOK SECTION --- */}
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasTikTok"
                        name="hasTikTok"
                        checked={!!(formInfo && formInfo.hasTikTok)}
                        action={(e) => updateFormInfo(e, null)}
                        value={user || onboarding ? checkPreviousData('brokerInfo', 'hasTikTok', user, onboarding) : ''}
                        yesno
                        label="TikTok"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasTikTok ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for TikTok Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="tiktok"
                                id="tiktok"
                                placeholder="I.E: https://tiktok.com/@jane-doe"
                                defaultValue={
                                  user || onboarding ? checkPreviousData('brokerInfo', 'tiktok', user, onboarding) : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for TikTok Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="tiktokHandler"
                                id="tiktokHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'tiktokHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />{' '}
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  {/* --- END: TIKTOK SECTION --- */}

                  {/* --- START: PINTEREST SECTION --- */}
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasPinterest"
                        name="hasPinterest"
                        checked={!!(formInfo && formInfo.hasPinterest)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasPinterest', user, onboarding) : ''
                        }
                        yesno
                        label="Pinterest"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasPinterest ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Pinterest Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M12 4a8 8 0 1 0 8 8c0-4.42-3.58-8-8-8zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                              </svg>
                              <input
                                type="text"
                                name="pinterest"
                                id="pinterest"
                                placeholder="I.E: https://pinterest.com/jane-doe"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'pinterest', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Pinterest Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M12 4a8 8 0 1 0 8 8c0-4.42-3.58-8-8-8zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                              </svg>
                              <input
                                type="text"
                                name="pinterestHandler"
                                id="pinterestHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'pinterestHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />{' '}
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  {/* --- END: PINTEREST SECTION --- */}

                  {/* --- START: THREADS SECTION --- */}
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasThreads"
                        name="hasThreads"
                        checked={!!(formInfo && formInfo.hasThreads)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasThreads', user, onboarding) : ''
                        }
                        yesno
                        label="Threads"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasThreads ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Threads Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="threads"
                                id="threads"
                                placeholder="I.E: https://threads.net/@jane-doe"
                                defaultValue={
                                  user || onboarding ? checkPreviousData('brokerInfo', 'threads', user, onboarding) : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe_broker)</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Threads Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="threadsHandler"
                                id="threadsHandler"
                                placeholder="@johndoe_broker"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'threadsHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />{' '}
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  {/* --- END: THREADS SECTION --- */}

                  {/* --- START: BLUESKY SECTION --- */}
                  <Row>
                    <Col sm={12}>
                      <SwitcherBox
                        type="checkbox"
                        id="hasBluesky"
                        name="hasBluesky"
                        checked={!!(formInfo && formInfo.hasBluesky)}
                        action={(e) => updateFormInfo(e, null)}
                        value={
                          user || onboarding ? checkPreviousData('brokerInfo', 'hasBluesky', user, onboarding) : ''
                        }
                        yesno
                        label="Bluesky"
                        labelPos="top"
                      />
                    </Col>
                    {formInfo && formInfo.hasBluesky ? (
                      <>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Link</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Bluesky Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="bluesky"
                                id="bluesky"
                                placeholder="I.E: https://bsky.app/profile/janedoe.bsky.social"
                                defaultValue={
                                  user || onboarding ? checkPreviousData('brokerInfo', 'bluesky', user, onboarding) : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={6}>
                          <div className={style.ax_field_with_icon}>
                            <label>Handle (i.e. @johndoe.bsky.social)</label>
                            <div className={style.iconInput}>
                              {/* Placeholder for Bluesky Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              <input
                                type="text"
                                name="blueskyHandler"
                                id="blueskyHandler"
                                placeholder="@johndoe.bsky.social"
                                defaultValue={
                                  user || onboarding
                                    ? checkPreviousData('brokerInfo', 'blueskyHandler', user, onboarding)
                                    : ''
                                }
                                onChange={(e) => updateFormInfo(e, null)}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col>
                          {' '}
                          <div className={style.sepparator} />{' '}
                        </Col>
                      </>
                    ) : (
                      ''
                    )}
                  </Row>
                  {/* --- END: BLUESKY SECTION --- */}

                  {/* --- START: NEW DECLARATIONS SECTION --- */}
                  <Row>
                    <Col sm={12} md={12}>
                      <FormSectionTitle title="Declarations" icon={<UilBalanceScale size={28} />} />
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={12}>
                      <div className={style.ax_field}>
                        <label htmlFor="">
                          Are you currently the subject of any reviews, complaints or investigations from any industry
                          or non-industry regulator or enforcement agency? <span>*</span>
                        </label>
                        <p
                          ref={declarationRegulatoryReviewWrapper}
                          className={`${formstyle.checkboxRow} ${isValid('declarationRegulatoryReview')}`}
                        >
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo.declarationRegulatoryReview === true} // Check for true
                              id="declarationRegulatoryReviewYes"
                              name="declarationRegulatoryReviewYes" // Unique name for the 'Yes' checkbox
                              value="Yes" // Value prop is not strictly needed but can stay
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e)}
                            />
                            Yes
                          </span>{' '}
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo.declarationRegulatoryReview === false} // Check for false
                              id="declarationRegulatoryReviewNo"
                              name="declarationRegulatoryReviewNo" // Unique name for the 'No' checkbox
                              value="No"
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e)}
                            />
                            No
                          </span>{' '}
                        </p>
                      </div>

                      {formInfo.declarationRegulatoryReview === true ? ( // Check for true
                        <div className={style.ax_field}>
                          <label htmlFor="declarationRegulatoryReviewDetails">
                            Please provide details <span>*</span>
                          </label>
                          <textarea
                            name="declarationRegulatoryReviewDetails"
                            className={isValid('declarationRegulatoryReviewDetails')}
                            id="declarationRegulatoryReviewDetails"
                            defaultValue={
                              user || onboarding
                                ? checkPreviousData(
                                    'brokerInfo',
                                    'declarationRegulatoryReviewDetails',
                                    user,
                                    onboarding
                                  )
                                : ''
                            }
                            onChange={(e) => updateFormInfo(e)}
                          />
                        </div>
                      ) : (
                        ''
                      )}

                      <div className={style.ax_field}>
                        <label htmlFor="">
                          Do you have any unresolved client complaints? <span>*</span>
                        </label>
                        <p
                          ref={declarationClientComplaintsWrapper}
                          className={`${formstyle.checkboxRow} ${isValid('declarationClientComplaints')}`}
                        >
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo.declarationClientComplaints === true} // Check for true
                              id="declarationClientComplaintsYes"
                              name="declarationClientComplaintsYes" // Unique name for the 'Yes' checkbox
                              value="Yes"
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e)}
                            />
                            Yes
                          </span>{' '}
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo.declarationClientComplaints === false} // Check for false
                              id="declarationClientComplaintsNo"
                              name="declarationClientComplaintsNo" // Unique name for the 'No' checkbox
                              value="No"
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e)}
                            />
                            No
                          </span>{' '}
                        </p>
                      </div>

                      {formInfo.declarationClientComplaints === true ? ( // Check for true
                        <div className={style.ax_field}>
                          <label htmlFor="declarationClientComplaintsDetails">
                            Please provide details <span>*</span>
                          </label>
                          <textarea
                            name="declarationClientComplaintsDetails"
                            className={isValid('declarationClientComplaintsDetails')}
                            id="declarationClientComplaintsDetails"
                            defaultValue={
                              user || onboarding
                                ? checkPreviousData(
                                    'brokerInfo',
                                    'declarationClientComplaintsDetails',
                                    user,
                                    onboarding
                                  )
                                : ''
                            }
                            onChange={(e) => updateFormInfo(e)}
                          />
                        </div>
                      ) : (
                        ''
                      )}
                    </Col>
                  </Row>
                  {/* --- END: NEW DECLARATIONS SECTION --- */}
                </>
              )}

              <Row style={{ marginTop: '32px' }}>
                <Col>
                  <p>
                    <strong>Credit Bureau Authorization: </strong>I authorize Indi Mortgage to obtain my credit report
                    and keep on file as per Equifax best practice requirements.
                  </p>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle
                    title="Signature"
                    icon={<UilEditAlt size={28} />}
                    subtitle="Draw your signature on the rectangle below and save it."
                  />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={6}>
                  {user &&
                  user.signature &&
                  user.signature.url &&
                  user.signature.url.length > 0 &&
                  !signature.isSaved ? (
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
                    showSavedSignature()
                  )}
                </Col>
              </Row>
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.brokerInfo &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.brokerInfo.firstSaveComplete) ||
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
                          action={(e) => updateUserAndBrokerInfoForm(e)}
                          color="highlight"
                          label={onboarding && onboarding.brokerInfo.signature ? 'Update Form' : 'Save Form'}
                          align="right"
                          disabled={!signature.isSaved}
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
        userAuth.forms.brokerInfo &&
        userAuth.forms.brokerInfo.isFormComplete ? (
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
        // user: userData,
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

export default BrokerInformation
