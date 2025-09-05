import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { saveAs } from 'file-saver'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import AuthContext from '../../context/authContext'
import { UilFileDownload, UilArrowRight } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import { serializeJson } from '../../helpers/serializeData'
import { checkValues, updateFormsInContext, filterCompletedForms, setLastFormVisited } from '../../helpers/savingForms'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import NextPrevFooter from '../../components/NextPrevFooter'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import { Validation } from '../../helpers/validateFields'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'

const LetterOfDirection = (props) => {
  const { onboarding, documents } = props
  const [formInfo, setFormInfo] = useState({
    ...onboarding.letterOfDirection,
    // Ensure selectedLetter is included, fallback to null if not present
    selectedLetter: onboarding.letterOfDirection?.selectedLetter || null
  })
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [iframeWidth, setIframeWidth] = useState(1000)
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [localMortgageSoftware, setLocalMortgageSoftware] = useState(onboarding?.brokerInfo?.mortgageSoftware || '')
  const [otherMtgSoftware, setOtherMtgSoftware] = useState(
    onboarding?.brokerInfo?.mortgageSoftware === 'Other' || false
  )
  const [localOtherMortgageSoftware, setLocalOtherMortgageSoftware] = useState(
    onboarding?.brokerInfo?.otherMortgageSoftware || ''
  )
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef(null)
  const router = useRouter()

  console.log(userAuth)

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const requiredFields = ['acknowledgement']

  // Mapping function to convert mortgageSoftware values to letterOfDirection property values
  const getMortgageSoftwareMapping = (mortgageSoftware) => {
    if (!mortgageSoftware || mortgageSoftware === 'Select') return 'expert'

    // Handle special cases
    if (mortgageSoftware === 'None') return null // No PDF needed

    // Normalize the selected mortgage software to lowercase
    const normalizedSoftware = mortgageSoftware.toLowerCase()

    // Special exception: ExpertPro should use Expert letter of direction
    if (normalizedSoftware === 'expertpro') {
      return 'expert'
    }

    // Check if we have a matching letterOfDirection in systemDocuments
    const availableLetterOfDirections = documents.systemDocuments
      .filter((doc) => doc.letterOfDirection)
      .map((doc) => doc.letterOfDirection.toLowerCase())

    // If we find a match, return the normalized software name
    if (availableLetterOfDirections.includes(normalizedSoftware)) {
      return normalizedSoftware
    }

    // Default fallback to 'expert' if no match found
    return 'expert'
  }

  const pdfLink = () => {
    // Get the mortgage software from broker information or local state
    const mortgageSoftware = localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware

    // Treat 'Select' as no selection, and return empty for 'None'
    if (!mortgageSoftware || mortgageSoftware === 'Select' || mortgageSoftware === 'None') {
      if (mortgageSoftware === 'None') {
        return ''
      }
      if (mortgageSoftware === 'Select') {
        return ''
      }
      // Only default to expert if truly no value (null/undefined)
      console.warn('No mortgage software selected, defaulting to expert')
      const defaultDoc = documents.systemDocuments.find((doc) => doc.letterOfDirection === 'expert')
      return defaultDoc?.file?.url || ''
    }

    // For "Other" mortgage software, check if otherMortgageSoftware field has value
    if (mortgageSoftware === 'Other') {
      const otherSoftware = localOtherMortgageSoftware || onboarding?.brokerInfo?.otherMortgageSoftware
    }

    // Get the corresponding letterOfDirection value
    const letterOfDirectionValue = getMortgageSoftwareMapping(mortgageSoftware)

    // Filter documents based on letterOfDirection property
    const matchingDoc = documents.systemDocuments.find((doc) => doc.letterOfDirection === letterOfDirectionValue)

    if (!matchingDoc) {
      console.warn(`No letter of direction document found for ${mortgageSoftware}, falling back to expert`)
      const fallbackDoc = documents.systemDocuments.find((doc) => doc.letterOfDirection === 'expert')
      return fallbackDoc?.file?.url || ''
    }

    return matchingDoc.file.url
  }

  // Handle mortgage software selection changes
  const handleMortgageSoftwareChange = (e) => {
    const value = e.target.value
    setLocalMortgageSoftware(value)

    if (value === 'Other') {
      setOtherMtgSoftware(true)
    } else {
      setOtherMtgSoftware(false)
      setLocalOtherMortgageSoftware('') // Clear other field when not "Other"
    }
  }

  // Handle other mortgage software input changes
  const handleOtherMortgageSoftwareChange = (e) => {
    setLocalOtherMortgageSoftware(e.target.value)
  }

  //Form Status and Fields Validation
  const validate = () => {
    const validation = Validation(formInfo, requiredFields, null, null)
    setFieldsValidation(validation)
    return validation
  }

  const zipAndDownload = async (pdfLink) => {
    const { userInfo } = userAuth
    const mortgageSoftware = onboarding?.brokerInfo?.mortgageSoftware || 'Expert'
    const zip = new JSZip()
    const zipFilename = `${mortgageSoftware.toLowerCase()}-letter-of-direction.zip`
    const filename = `${mortgageSoftware}-Letter-Of-Direction.pdf`
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

  const updateLetterOfDirectionForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')

    const isValidated = await validate()
    const formsPercentCompletion = await filterCompletedForms(
      userAuth.forms,
      'letterOfDirection',
      isValidated.length > 0
    )

    // Prepare the mortgage software data for brokerInfo if it was selected locally
    const brokerInfoUpdate =
      localMortgageSoftware && localMortgageSoftware !== onboarding?.brokerInfo?.mortgageSoftware
        ? {
            ...onboarding.brokerInfo,
            mortgageSoftware: localMortgageSoftware,
            ...(localMortgageSoftware === 'Other'
              ? { otherMortgageSoftware: localOtherMortgageSoftware }
              : { otherMortgageSoftware: '' }) // Clear other field when not "Other"
          }
        : null

    //Building Onboarding letterOfDirection form data and potentially brokerInfo update
    const formObj = () => {
      // Determine the selected letter type based on mortgage software selection
      const selectedLetter = getMortgageSoftwareMapping(localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware)
      
      console.log('Saving selectedLetter:', selectedLetter, 'for mortgage software:', localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware)
      
      const baseObj = {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        letterOfDirection: {
          ...formInfo,
          selectedLetter: selectedLetter,
          isFormComplete: isValidated.length === 0,
          firstSaveComplete: true,
          acknowledgement: true
        }
      }

      // Add brokerInfo update if mortgage software was selected locally
      if (brokerInfoUpdate) {
        baseObj.brokerInfo = brokerInfoUpdate
      }

      return baseObj
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form' })

    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboarding.id}`, formObj(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(async (res) => res.data)
      .catch((err) => {
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    setFormInfo({ ...formInfo, ...updatedForm.letterOfDirection })

    //Updating form in Context - update letterOfDirection first
    let updatedCtxForm = await updateFormsInContext(
      'letterOfDirection',
      updatedForm.letterOfDirection,
      updatedForm,
      userAuth
    )

    // If we also updated brokerInfo, update that context too
    if (brokerInfoUpdate && updatedForm.brokerInfo) {
      updatedCtxForm = await updateFormsInContext('brokerInfo', updatedForm.brokerInfo, updatedForm, updatedCtxForm)
    }

    await setUserAuth(updatedCtxForm)

    if (e.target.id === 'downloaded') {
      zipAndDownload(pdfLink())
    }

    if (e.target.id === 'notRequired') {
      router.push('/webforms/payment-authorization')
    }

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Letter Of Direction form saved!' })
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
    setUserAuth({
      ...userAuth,
      lastFormVisited: 'letter-of-direction'
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
    setLastFormVisited('letter-of-direction', onboarding.id, config)
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
      updateLetterOfDirectionForm(e)
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
                <h1 className={style.ax_page_title}>Letter Of Direction</h1>
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

            <form
              className={`${style.ax_form} ${formstyle.onboardingForm}`}
              ref={form}
              style={{ padding: '32px 64px' }}
            >
              {/* Conditional mortgage software selection - only show if not already selected */}
              {(!onboarding?.brokerInfo?.mortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware === 'Select') && (
                <Row style={{ marginBottom: '32px' }}>
                  <Col sm={12}>
                    <div
                      style={{
                        background: '#f8f9fa',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        marginBottom: '24px'
                      }}
                    >
                      <h3 style={{ marginBottom: '16px', color: '#495057' }}>
                        Please select your mortgage software platform to view the correct letter of direction:
                      </h3>

                      <Row>
                        <Col sm={12} md={4}>
                          <div className={style.ax_field}>
                            <label htmlFor="mortgageSoftware">Mortgage Software Platform</label>
                            <select
                              id="mortgageSoftware"
                              name="mortgageSoftware"
                              value={localMortgageSoftware}
                              onChange={handleMortgageSoftwareChange}
                            >
                              <option value="">Select</option>
                              <option value="Expert">Expert</option>
                              <option value="ExpertPro">ExpertPro</option>
                              <option value="Finmo">Finmo</option>
                              <option value="Scarlett">Scarlett</option>
                              <option value="Velocity">Velocity</option>
                              <option value="Other">Other</option>
                              <option value="None">I do not use mortgage software</option>
                            </select>
                          </div>
                        </Col>

                        {otherMtgSoftware && (
                          <Col sm={12} md={4}>
                            <div className={style.ax_field}>
                              <label htmlFor="otherMortgageSoftware">Please specify:</label>
                              <input
                                type="text"
                                name="otherMortgageSoftware"
                                id="otherMortgageSoftware"
                                placeholder="Enter your mortgage software"
                                value={localOtherMortgageSoftware}
                                onChange={handleOtherMortgageSoftwareChange}
                              />
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  </Col>
                </Row>
              )}

              <Row>
                <Col>
                  {/* Check if user selected "None" (doesn't use mortgage software) */}
                  {localMortgageSoftware === 'None' || onboarding?.brokerInfo?.mortgageSoftware === 'None' ? (
                    <div
                      style={{
                        background: '#fff3cd',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #ffeaa7',
                        textAlign: 'center',
                        marginBottom: '32px'
                      }}
                    >
                      <h3 style={{ color: '#856404', marginBottom: '16px' }}>No Letter of Direction Required</h3>
                      <p style={{ color: '#856404', fontSize: '16px', margin: 0 }}>
                        Since you do not use mortgage software, no letter of direction is needed. Please click on{' '}
                        <strong>"not required"</strong> and proceed to next steps.
                      </p>
                    </div>
                  ) : (
                    (() => {
                      // Determine the current mortgage software selection
                      const currentSelection = localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware

                      // Show "Please select" message only if no selection or "Select" is chosen
                      if (!currentSelection || currentSelection === 'Select' || currentSelection === '') {
                        return (
                          <div
                            style={{
                              background: '#f8f9fa',
                              padding: '24px',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6',
                              textAlign: 'center',
                              marginBottom: '32px'
                            }}
                          >
                            <h3 style={{ color: '#6c757d', marginBottom: '16px' }}>
                              Please Select Your Mortgage Software
                            </h3>
                            <p style={{ color: '#6c757d', fontSize: '16px', margin: 0 }}>
                              Select your mortgage software platform above to view the corresponding letter of
                              direction.
                            </p>
                          </div>
                        )
                      }

                      // Hide iframe for "Other" selections
                      if (currentSelection === 'Other') {
                        return ''
                      }

                      // For valid selections (Expert, ExpertPro, Finmo, Velocity, Scarlett), show the PDF
                      return (
                        <div className={style.frame}>
                          <iframe
                            width={iframeWidth}
                            height="1200"
                            title="Letter Of Direction"
                            src={pdfLink() && pdfLink().length > 0 ? pdfLink() : ''}
                            type="application/pdf"
                          />
                        </div>
                      )
                    })()
                  )}
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={12} style={{ marginTop: '32px' }}>
                  {/* Only show transfer message if user actually uses mortgage software and it's not "Other" */}
                  {localMortgageSoftware !== 'None' &&
                    onboarding?.brokerInfo?.mortgageSoftware !== 'None' &&
                    localMortgageSoftware !== 'Other' &&
                    onboarding?.brokerInfo?.mortgageSoftware !== 'Other' && (
                      <p>
                        This form is required to be signed by your existing Broker of Record at your current brokerage.
                        Please download the form should you wish to have your existing{' '}
                        {
                          // Use local selection first, then fallback to onboarding data
                          (() => {
                            const selectedSoftware =
                              localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware || 'Expert'
                            if (selectedSoftware === 'Select' || !selectedSoftware) return 'Expert'
                            if (selectedSoftware === 'Other') {
                              return (
                                localOtherMortgageSoftware || onboarding?.brokerInfo?.otherMortgageSoftware || 'Expert'
                              )
                            }
                            return selectedSoftware
                          })()
                        }{' '}
                        data transferred. Once signed by the existing Broker of Record please return to{' '}
                        <strong>matt.brownlow@indimortgage.ca</strong>.
                      </p>
                    )}
                  <p>
                    {(() => {
                      const currentSelection = localMortgageSoftware || onboarding?.brokerInfo?.mortgageSoftware

                      if (currentSelection === 'None') {
                        return 'Please click on "not required" and proceed to next steps.'
                      } else if (currentSelection === 'Other') {
                        return 'Please click on "not required" and proceed to next steps.'
                      } else {
                        return 'Otherwise please click on "not required" and proceed to next steps.'
                      }
                    })()}
                  </p>
                </Col>
              </Row>
              {userAuth && userAuth.forms && userAuth.forms.isLocked === false ? (
                <Row justify="end">
                  <Col sm={12} md={5} style={{ marginTop: '32px' }}>
                    <Button
                      color="highlight"
                      label="Download Letter of Direction"
                      icon={<UilFileDownload size={16} />}
                      iconPos="left"
                      id="downloaded"
                      name="downloaded"
                      action={(e) => updateLetterOfDirectionForm(e)}
                      align="right"
                    />
                  </Col>
                  <Col sm={12} md={4} style={{ marginTop: '32px' }}>
                    <Button
                      color="highlight"
                      label="Not Required"
                      icon={<UilArrowRight size={16} />}
                      iconPos="right"
                      action={(e) => updateLetterOfDirectionForm(e)}
                      id="notRequired"
                      name="notRequired"
                      align="right"
                    />
                  </Col>
                </Row>
              ) : (
                ''
              )}
            </form>
          </Col>
        </Row>
        {userAuth &&
        userAuth.forms &&
        userAuth.forms.isFormSaved &&
        userAuth.forms.letterOfDirection &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.letterOfDirection.isFormComplete ? (
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

    const letter = await axios
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
        documents: letter
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

export default LetterOfDirection
