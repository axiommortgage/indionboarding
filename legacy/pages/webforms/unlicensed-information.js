/* eslint-disable prefer-destructuring */
import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'

import Moment from 'react-moment'
import {
  UilFileDownload,
  UilUserCircle,
  UilMobileVibrate,
  UilMapMarker,
  UilEditAlt,
  UilCheckCircle
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
import NextPrevFooter from '../../components/NextPrevFooter'
import { PhoneInput } from '../../components/MaskedInputs'
import { getRawPhone } from '../../helpers/formatPhone'
import AddressSelect from '../../components/AddressSelect'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import FormSectionTitle from '../../components/FormSectionTitle'
import { Validation } from '../../helpers/validateFields'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import SecureImage from '../../components/SecureImage'
import getAccessibleUrl from '../../helpers/getAccessibleUrl'

const unlicensedInformation = (props) => {
  const { onboarding, branches } = props
  const [formInfo, setFormInfo] = useState(onboarding.unlicensedInfo)
  const [isInked, setIsInked] = useState(null)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [sameAddressWarning, setSameAddressWarning] = useState({ showMessage: false, sameAddress: null })
  const [charCount, setCharCount] = useState({ bio: 0, note: 0 })
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
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

  //Required Fields and and Empty Values Checker
  const requiredFields = [
    'firstname',
    'lastname',
    'workEmail',
    'address',
    'city',
    'province',
    'postalCode',
    'personalAddress',
    'personalCity',
    'personalProvince',
    'personalPostalCode',
    'cellPhone',
    'emergencyContact',
    'emergencyPhone',
    'completingCompliance',
    'assistantTo'
  ]

  //Check if Signature Exists
  const signature = checkSignature(formInfo.signature)

  //Form Status and Fields Validation
  const validate = async (sig) => {
    const validation = Validation(formInfo, requiredFields, checkSignature(sig).isSaved, null)
    setFieldsValidation(validation)
    return validation
  }

  //Current formInfo Object Updater
  const updateFormInfo = (e, type) => {
    if (
      type &&
      type !== null &&
      type !== undefined &&
      type !== '' &&
      (type === 'officeAddress' || type === 'personalAddress')
    ) {
      const { name, value } = e.target
      const officeFields = ['address', 'suiteUnit', 'city', 'province', 'postalCode']
      if (type === 'personalAddress') {
        officeFields.forEach((f) => {
          if (f.toLowerCase() === name.toLowerCase().replace('personal', '')) {
            if (
              formInfo[f] &&
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
    } else if (type === 'languages') {
      const name = type
      const value = e
      setFormInfo({ ...formInfo, [name]: value })
    } else {
      let { name, value } = e.target

      if (e.target.type === 'checkbox') {
        if (
          (e.target.name === 'completingComplianceNo' && e.target.checked === true) ||
          (e.target.name === 'completingComplianceNo' && e.target.checked === 'true')
        ) {
          name = 'completingCompliance'
          value = false
        } else if (
          (e.target.name === 'completingComplianceYes' && e.target.checked === true) ||
          (e.target.name === 'completingComplianceYes' && e.target.checked === 'true')
        ) {
          name = 'completingCompliance'
          value = true
        } else {
          if (e.target.checked === 'true' || e.target.checked === true) {
            value = true
          }
          if (e.target.checked === 'false' || e.target.checked === false) {
            value = false
          }
        }
      }

      if (e.target.type === 'tel') {
        value = { masked: value, raw: value.replace(/\D/g, '') }
      }

      if (e.target.name === 'bio') {
        setCharCount({ ...charCount, bio: e.target.value.length })
      }

      if (e.target.name === 'additionalNotes') {
        setCharCount({ ...charCount, note: e.target.value.length })
      }

      if (
        userAuth.forms.isFormSaved === true ||
        userAuth.forms.isFormSaved === undefined ||
        userAuth.forms.isFormSaved === null
      ) {
        setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
      }

      setFormInfo({ ...formInfo, [name]: value })
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

    try {
      const token = await Cookies.get('jwt')
      const formDate = new Date()
      let signatureImg

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

        if (isInked === false) {
          throw new Error('Please add a real signature.')
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
            setFormInfo({ ...formInfo, signature: sig.data[0] })
            return sig.data[0]
          })
          .catch((err) => {
            throw new Error(`Upload failed: ${err.message}`)
          })
      }

      // Common code for both paths
      const isValidated = await validate(signatureImg)
      const rawPhones = await getRawPhone(formInfo)
      const formsPercentCompletion = await filterCompletedForms(
        userAuth.forms,
        'unlicensedInfo',
        isValidated.length > 0
      )

      // Build form data object
      const formObj = () => ({
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        unlicensedInfo: {
          ...formInfo,
          ...rawPhones,
          isFormComplete: isValidated.length === 0,
          firstSaveComplete: true,
          signature: signatureImg
        }
      })

      const userObj = formObj().unlicensedInfo
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

      const finalUserObj = { ...newUserObj, phone: formObj().unlicensedInfo.workPhone }

      setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating User Profile...' })

      // Update user
      await axios
        .put(`${apiUrl}/users/${user.id}`, finalUserObj, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setUserAuth({ ...userAuth, userInfo: res.data })
          return res.data
        })
        .catch((err) => {
          throw new Error(`User update failed: ${err.message}`)
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

      setFormInfo({ ...formInfo, ...updatedForm.unlicensedInfo })

      // Update context
      const updatedCtxForm = updateFormsInContext(
        'unlicensedInfo',
        updatedForm.unlicensedInfo,
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
        message: error.message
      })

      if (error.message === 'Please add a real signature.') {
        applicantSign.current?.clear()
      }

      console.error('Signature save error:', error)
    }
  }

  //Updating the Form
  const updateUserAndUnlicensedInfoForm = async (e) => {
    // return unformatPhone(formInfo)
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating Information' })

    const token = Cookies.get('jwt')
    const isValidated = await validate(formInfo.signature)

    const rawPhones = await getRawPhone(formInfo)

    const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'unlicensedInfo', isValidated.length > 0)

    //Building Onboarding unlicensedInfo form data
    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          unlicensedInfo: {
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
        unlicensedInfo: {
          ...formInfo,
          ...rawPhones,
          isFormComplete: true,
          firstSaveComplete: true
        }
      }
    }

    const userObj = await formObj().unlicensedInfo
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

    const finalUserObj = { ...newUserObj, phone: formObj().unlicensedInfo.workPhone }

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
      .then((res) => res.data)
      .catch((err) => {
        console.log(err)
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
      })

    setFormInfo({ ...formInfo, ...updatedForm.unlicensedInfo })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext('unlicensedInfo', updatedForm.unlicensedInfo, updatedForm, userAuth)
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
    }
    setFormInfo({ ...formInfo, ...selectedAddress })
  }

  //Rendering Signature if it is saved
  const showSavedSignature = () => {
    if (signature.isSaved) {
      console.log('Signature data:', formInfo.signature)

      return (
        <>
          <div style={{ width: '100%', maxWidth: '400px', display: 'block' }}>
            <SecureImage src={formInfo.signature.url} alt="Signature" style={{ width: '100%', height: 'auto' }} />
          </div>
          <p>
            <strong>Signed on: </strong>
            <Moment format="LLLL">{formInfo.signature.createdAt || new Date()}</Moment>
          </p>
        </>
      )
    }

    // If user has a signature in their profile but hasn't signed this form yet
    if (user && user.signature && user.signature.url && user.signature.url.length > 0) {
      return (
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
      )
    }

    // If no signature exists, show the canvas
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
        {signature.isSaved ? (
          <h2 style={{ color: 'green' }}>
            <UilCheckCircle size={16} /> Signature Saved!
          </h2>
        ) : (
          ''
        )}
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
      </>
    )
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }

    setUserAuth({ ...userAuth, lastFormVisited: 'unlicensed-information' })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('unlicensed-information', onboarding.id, config)
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
      updateUserAndUnlicensedInfoForm(e)
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
                <h1 className={style.ax_page_title}>Information</h1>
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
              <Col sm={12} md={3} lg={2} style={{ marginBottom: '16px' }}>
                <Button
                  icon={<UilFileDownload />}
                  disabled={!formInfo.isFormComplete}
                  align="right"
                  color="highlight"
                  action={() => PdfGenerator('button', 'unlicensedInformation', null, formInfo)}
                  label="PDF"
                />
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
                      type="text"
                      name="firstname"
                      id="firstname"
                      placeholder="Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'firstname', user, onboarding) : ''
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
                      name="middlename"
                      id="middlename"
                      placeholder="Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'middlename', user, onboarding) : ''
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
                      id="lastname"
                      placeholder="Last Name"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'lastname', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="assistantTo">
                      Assistant To <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="assistantTo"
                      id="assistantTo"
                      placeholder=""
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'assistantTo', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>

                <Col sm={12} md={4}>
                  <div className={style.ax_field}>
                    <label htmlFor="assistantTo">
                      Completing Compliance <span>*</span>
                    </label>
                    <p>
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.completingCompliance === 'Yes') ||
                            (formInfo && formInfo.completingCompliance === true)
                          }
                          id="completingComplianceYes"
                          name="completingComplianceYes"
                          value={formInfo && formInfo.completingComplianceYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.completingCompliance === 'No') ||
                            (formInfo && formInfo.completingCompliance === false)
                          }
                          id="completingComplianceNo"
                          name="completingComplianceNo"
                          value={formInfo && formInfo.completingComplianceNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                    </p>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Contact" icon={<UilMobileVibrate size={28} />} />
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <label htmlFor="workEmail">
                      Preferred Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      id="workEmail"
                      placeholder="johndoe@indimortgage.ca"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'workEmail', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, null)}
                    />
                  </div>
                </Col>
                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="cellPhone">
                        Cell Phone <span>*</span>
                      </label>
                      <PhoneInput
                        type="tel"
                        name="cellPhone"
                        id="cellPhone"
                        placeholder="999-888-7777"
                        defaultValue={
                          user || onboarding ? checkPreviousData('unlicensedInfo', 'cellPhone', user, onboarding) : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>

                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="emergencyContact">
                        Emergency Contact Name<span>*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        id="emergencyContact"
                        placeholder="John Doe"
                        defaultValue={
                          user || onboarding
                            ? checkPreviousData('unlicensedInfo', 'emergencyContact', user, onboarding)
                            : ''
                        }
                        onChange={(e) => updateFormInfo(e, null)}
                      />
                    </div>
                  </div>
                </Col>

                <Col sm={12} md={3}>
                  <div className={style.ax_field}>
                    <div>
                      <label htmlFor="emergencyPhone">
                        Emergency Contact Phone <span>*</span>
                      </label>
                      <PhoneInput
                        type="tel"
                        name="emergencyPhone"
                        id="emergencyPhone"
                        placeholder="999-888-7777"
                        defaultValue={
                          user || onboarding
                            ? checkPreviousData('unlicensedInfo', 'emergencyPhone', user, onboarding)
                            : ''
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
                      id="address"
                      placeholder="223 14 Street NW"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'address', user, onboarding) : ''
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
                      defaultValue={checkPreviousData('unlicensedInfo', 'suiteUnit', user, onboarding)}
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
                      id="city"
                      placeholder="Calgary"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'city', user, onboarding) : ''
                      }
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
                      placeholder="Alberta"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'province', user, onboarding) : ''
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
                      id="postalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'postalCode', user, onboarding) : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'officeAddress')}
                    />
                  </div>
                </Col>
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
                      className={fieldsValidation.some((f) => f.id === 'personalAddress') ? style.inputDanger : ''}
                      id="personalAddress"
                      placeholder="223 14 Street NW"
                      defaultValue={
                        user || onboarding
                          ? checkPreviousData('unlicensedInfo', 'personalAddress', user, onboarding)
                          : ''
                      }
                      onChange={(e) => updateFormInfo(e, 'personalAddress')}
                    />
                  </div>
                </Col>
                <Col sm={12} md={2}>
                  <div className={style.ax_field}>
                    <label htmlFor="personalSuiteUnit">Suite/Unit</label>
                    <input
                      type="text"
                      name="personalSuiteUnit"
                      id="personalSuiteUnit"
                      placeholder="suite/unit"
                      defaultValue={checkPreviousData('unlicensedInfo', 'personalSuiteUnit', user, onboarding)}
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
                      className={fieldsValidation.some((f) => f.id === 'personalCity') ? style.inputDanger : ''}
                      id="personalCity"
                      placeholder="Calgary"
                      defaultValue={
                        user || onboarding ? checkPreviousData('unlicensedInfo', 'personalCity', user, onboarding) : ''
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
                      className={fieldsValidation.some((f) => f.id === 'personalProvince') ? style.inputDanger : ''}
                      id="personalProvince"
                      placeholder="Alberta"
                      defaultValue={
                        user || onboarding
                          ? checkPreviousData('unlicensedInfo', 'personalProvince', user, onboarding)
                          : ''
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
                      className={fieldsValidation.some((f) => f.id === 'personalPostalCode') ? style.inputDanger : ''}
                      id="personalPostalCode"
                      placeholder="T2N 1Z6"
                      defaultValue={
                        user || onboarding
                          ? checkPreviousData('unlicensedInfo', 'personalPostalCode', user, onboarding)
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
                  {showSavedSignature()}
                </Col>
              </Row>
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.unlicensedInfo &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.unlicensedInfo.firstSaveComplete) ||
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
                          action={(e) => updateUserAndUnlicensedInfoForm(e)}
                          color="highlight"
                          label={onboarding && onboarding.unlicensedInfo.signature ? 'Update Form' : 'Save Form'}
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
        userAuth.forms.unlicensedInfo &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.unlicensedInfo.isFormComplete ? (
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

export default unlicensedInformation
