import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import AuthContext from '../../context/authContext'
import { UilFileDownload, UilCheckCircle, UilArrowLeft } from '@iconscout/react-unicons'
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
import SignatureCanvas from 'react-signature-canvas'
import { Validation } from '../../helpers/validateFields'
import { captureSignature, createSignatureFormData } from '../../helpers/signatureCapture'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'
import SecureImage from '../../components/SecureImage'
import getAccessibleUrl from '../../helpers/getAccessibleUrl'

const unlicensedPolicies = (props) => {
  const { onboarding, compliance } = props
  const [formInfo, setFormInfo] = useState(onboarding.unlicensedPolicies)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [textNodes, setTextNodes] = useState(null)
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef(null)
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

  const complianceManual = () => {
    const cplc = compliance.systemDocuments.filter(
      (c) => c.unlicensedPolicyProcedure === true && c.unlicensedPolicyProcedure !== null
    )
    return cplc[0].file.url
  }
  complianceManual()

  const requiredFields = ['brokerName']

  //Check if Signature Exists
  const signature = checkSignature(formInfo.signature)

  //Form Status and Fields Validation
  const validate = (sig) => {
    const validation = Validation(formInfo, requiredFields, checkSignature(sig).isSaved, null)
    setFieldsValidation(validation)
    return validation
  }

  //Current formInfo Object Updater
  const updateFormInfo = (e) => {
    const { name } = e.target
    let { value } = e.target
    if (e.target.type === 'checkbox') {
      value = e.target.checked
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

  //Checking If Signature Canvas is Empty
  const signatureIsEmpty = async () => {
    const HtmlNode = await applicantSign.current
    if (HtmlNode) {
      setIsSignatureEmpty(HtmlNode.isEmpty())
      return HtmlNode.isEmpty()
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

    console.log('Starting signature save process')
    console.log('Initial formInfo before saving signature:', formInfo)

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Generating signature file...' })
    let signatureImg
    const token = await Cookies.get('jwt')
    const formDate = new Date()

    if (e.target.id !== 'oneClickSign') {
      try {
        // Check if applicantSign.current exists before trying to access isEmpty()
        if (!applicantSign.current) {
          console.error('Signature component not initialized')
          setProcessingStatus({
            visible: true,
            status: 'error',
            message: 'Signature component not initialized properly'
          })
          setTimeout(() => {
            setProcessingStatus({ visible: false, status: '', message: '' })
          }, 3000)
          throw new Error('Signature component not initialized properly')
        }

        if (applicantSign.current.isEmpty()) {
          console.error('Signature is empty')
          setProcessingStatus({
            visible: true,
            status: 'error',
            message: 'Please sign before saving'
          })
          setTimeout(() => {
            setProcessingStatus({ visible: false, status: '', message: '' })
          }, 3000)
          throw new Error('Signature is empty')
        }

        // Use helper function to capture signature
        const signatureBlob = await captureSignature(applicantSign, signatureCanvas, htmlToImage)
        console.log('Signature blob created')

        // Create form data with helper
        const imageData = createSignatureFormData(signatureBlob, user)
        console.log('Form data created for signature upload')

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving signature...' })

        try {
          const sigResponse = await axios.post(`${apiUrl}/upload`, imageData, {
            headers: { Authorization: `Bearer ${token}` }
          })

          console.log('Full signature response:', sigResponse)
          console.log('Signature data from response:', sigResponse.data[0])

          signatureImg = sigResponse.data[0]

          // Update formInfo with the new signature
          const updatedFormInfo = {
            ...formInfo,
            signature: signatureImg
          }

          console.log('Updated formInfo with signature:', updatedFormInfo)
          setFormInfo(updatedFormInfo)

          // Now save the updated formInfo to the database
          const isValidated = await validate(signatureImg)
          const formsPercentCompletion = await filterCompletedForms(
            userAuth.forms,
            'unlicensedPolicies',
            isValidated.length > 0
          )

          // Build form data object
          const formObj = () => ({
            completionPercent: formsPercentCompletion,
            isSubmited: false,
            unlicensedPolicies: {
              ...updatedFormInfo,
              isFormComplete: isValidated.length === 0,
              firstSaveComplete: true,
              signature: signatureImg,
              signatureDate: formDate
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

          setFormInfo({ ...updatedFormInfo, ...updatedForm.unlicensedPolicies })

          // Update context
          const updatedCtxForm = updateFormsInContext(
            'unlicensedPolicies',
            updatedForm.unlicensedPolicies,
            updatedForm,
            userAuth
          )
          setUserAuth(updatedCtxForm)

          // Show success message
          setProcessingStatus({ status: 'success', visible: true, message: 'Signature saved successfully!' })

          // Hide message after a delay
          setTimeout(() => {
            setProcessingStatus({ visible: false, status: '', message: '' })
          }, 3000)
        } catch (error) {
          console.error('Error during signature upload or form update:', error)
          setProcessingStatus({
            visible: true,
            status: 'error',
            message: `Error: ${error.message}`
          })
          setTimeout(() => {
            setProcessingStatus({ visible: false, status: '', message: '' })
          }, 3000)
        }
      } catch (error) {
        console.error('Error in signature capture:', error)
        // Error handling is already done in the nested try-catch blocks
      }
    } else {
      // Handle one-click signing
      try {
        signatureImg = user.signature

        if (!signatureImg || !signatureImg.url) {
          throw new Error('No existing signature found')
        }

        // Update formInfo with the existing signature
        const updatedFormInfo = {
          ...formInfo,
          signature: signatureImg
        }
        setFormInfo(updatedFormInfo)

        // Continue with form validation and saving
        const isValidated = await validate(signatureImg)
        const formsPercentCompletion = await filterCompletedForms(
          userAuth.forms,
          'unlicensedPolicies',
          isValidated.length > 0
        )

        // Build form data object
        const formObj = () => ({
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          unlicensedPolicies: {
            ...updatedFormInfo,
            isFormComplete: isValidated.length === 0,
            firstSaveComplete: true,
            signature: signatureImg,
            signatureDate: formDate
          }
        })

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
        setFormInfo({ ...updatedFormInfo, ...updatedForm.unlicensedPolicies })

        // Update context
        const updatedCtxForm = updateFormsInContext(
          'unlicensedPolicies',
          updatedForm.unlicensedPolicies,
          updatedForm,
          userAuth
        )
        setUserAuth(updatedCtxForm)

        // Show success message
        setProcessingStatus({ status: 'success', visible: true, message: 'Signature saved successfully!' })

        // Hide message after a delay
        setTimeout(() => {
          setProcessingStatus({ visible: false, status: '', message: '' })
        }, 3000)
      } catch (error) {
        setProcessingStatus({ status: 'error', visible: true, message: `Error: ${error.message}` })
        console.error('One-click sign error:', error)

        // Hide error message after a delay
        setTimeout(() => {
          setProcessingStatus({ visible: false, status: '', message: '' })
        }, 3000)
      }
    }
  }

  const updateunlicensedPoliciesForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const isValidated = await validate(formInfo.signature)
    const formDate = new Date()
    const formsPercentCompletion = await filterCompletedForms(
      userAuth.forms,
      'unlicensedPolicies',
      isValidated.length > 0
    )

    //Building Onboarding unlicensedPolicies form data
    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          unlicensedPolicies: {
            ...formInfo,
            isFormComplete: false,
            firstSaveComplete: true,
            signatureDate: formDate
          }
        }
      }

      return {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        unlicensedPolicies: {
          ...formInfo,
          isFormComplete: true,
          firstSaveComplete: true,
          signatureDate: formDate
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

    setFormInfo({ ...formInfo, ...updatedForm.unlicensedPolicies })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext(
      'unlicensedPolicies',
      updatedForm.unlicensedPolicies,
      updatedForm,
      userAuth
    )
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Policies and Procedure form saved!' })
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

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }
    setUserAuth({ ...userAuth, lastFormVisited: 'policies' })
  }, [user])

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('policies', onboarding.id, config)
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
      updateunlicensedPoliciesForm(e)
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

  useEffect(() => {
    console.log('API URL from environment:', process.env.NEXT_PUBLIC_API_URL)
    console.log('Current API URL being used:', apiUrl)
  }, [])

  useEffect(() => {
    console.log('Current formInfo:', formInfo)

    if (formInfo && formInfo.signature) {
      console.log('Signature object in formInfo:', formInfo.signature)

      if (formInfo.signature.url) {
        console.log('Signature URL in formInfo:', formInfo.signature.url)
        console.log('Testing URL transformation:')
        const transformed = getAccessibleUrl(formInfo.signature.url)
        console.log('Transformed result:', transformed)
      } else {
        console.log('Signature object exists but has no URL property')
      }
    } else {
      console.log('No signature object found in formInfo')
    }
  }, [formInfo])

  // Add this useEffect to test a known S3 URL
  useEffect(() => {
    const testUrl =
      'https://indi-strapi-v2.s3.us-east-1.amazonaws.com/private/images/origin/applicant_Signature_Bruno_Cesar_Sousa_44025f1575.png'
    console.log('Test URL transformation:')
    console.log('Original:', testUrl)
    console.log('Transformed:', getAccessibleUrl(testUrl))
  }, [])

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
                <h1 className={style.ax_page_title}>Unlicensed Assistant Policy</h1>
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
                  <p>
                    I acknowledge that I have read the <strong>Indi Mortgage</strong> (the "brokerage"){' '}
                    <a className={formstyle.link} href={complianceManual()} target="_blank">
                      Unlicensed Assistant Policies and Procedures Manual
                    </a>{' '}
                    (the "Manual") in its entirety. I confirm that I will adhere to the practices and procedures
                    contained within.
                  </p>
                  <p>
                    I also acknowledge it is my sole responsibility to keep updated on any changes made to the Manual
                    and that changes made will be communicated to me by the brokerage.
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: '40px', marginBottom: '40px' }} className={formstyle.content}>
                <Col sm={12} md={6}>
                  {showSavedSignature()}
                  {onboarding.unlicensedPolicies.brokerName && onboarding.unlicensedPolicies.brokerName !== null ? (
                    <p>
                      <strong>{onboarding.unlicensedPolicies.brokerName}</strong>
                    </p>
                  ) : (
                    <p style={{ marginTop: '40px', marginBottom: '40px' }}>
                      <input
                        type="text"
                        name="brokerName"
                        id="brokerName"
                        onChange={(e) => updateFormInfo(e)}
                        placeholder="Broker/Agent Name*"
                        defaultValue={checkPreviousData('unlicensedPolicies', 'brokerName', user, onboarding)}
                      ></input>
                    </p>
                  )}
                </Col>
              </Row>
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.unlicensedPolicies &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.unlicensedPolicies.firstSaveComplete) ||
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
                          action={(e) => updateunlicensedPoliciesForm(e)}
                          color="highlight"
                          label={onboarding && onboarding.unlicensedPolicies.signature ? 'Update Form' : 'Save Form'}
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
        userAuth.forms.unlicensedPolicies &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.unlicensedPolicies.isFormComplete ? (
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

    const complianceData = await axios
      .get(`${API_URL}/documents`, config)
      .then((res) => {
        const cplc = res.data
        const serializedData = serializeJson(cplc)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        onboarding: onboardingData,
        compliance: complianceData
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

export default unlicensedPolicies
