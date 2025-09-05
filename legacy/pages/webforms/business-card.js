/* eslint-disable prefer-destructuring */
import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import { UilTimesCircle, UilFileDownload } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import FormSectionTitle from '../../components/FormSectionTitle'
import { serializeJson } from '../../helpers/serializeData'
import AuthContext from '../../context/authContext'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import { getRawPhone } from '../../helpers/formatPhone'
import Processing from '../../components/Processing'
import NextPrevFooter from '../../components/NextPrevFooter'
import { Validation } from '../../helpers/validateFields'
import { updateFormsInContext, filterCompletedForms, setLastFormVisited } from '../../helpers/savingForms'
import loaderPosition from '../../helpers/loaderScrollPosition'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'

const BusinessCardInfo = (props) => {
  const { onboarding } = props
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const [formInfo, setFormInfo] = useState(onboarding.businessCardInfo)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const user = userAuth.userInfo
  const form = useRef()
  const fieldWrapper = useRef()
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
  const requiredFields = ['businessCardOptOut']

  //Form Status and Fields Validation
  const validate = () => {
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

    if (e.target.id === 'businessCardOptOutYes' || e.target.id === 'businessCardOptOutNo') {
      fieldWrapper.current.classList.remove(style.inputDanger)

      value = e.target.checked

      if (e.target.type === 'checkbox') {
        if (
          (e.target.name === 'businessCardOptOutNo' && value === true) ||
          (e.target.name === 'businessCardOptOutNo' && value === 'true')
        ) {
          name = 'businessCardOptOut'
          value = false
          setFormInfo({
            ...formInfo,
            businessCardOptOut: value,
            businessCardOptOutNo: 'Yes',
            businessCardOptOutYes: 'No'
          })
        }
        if (
          (e.target.name === 'businessCardOptOutYes' && value === true) ||
          (e.target.name === 'businessCardOptOutYes' && value === 'true')
        ) {
          name = 'businessCardOptOut'
          value = true
          setFormInfo({
            ...formInfo,
            businessCardOptOut: value,
            businessCardOptOutNo: 'No',
            businessCardOptOutYes: 'Yes'
          })
        }
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

  //Updating the Form
  const updateBusinessCardForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving Business Card Info...' })

    const token = Cookies.get('jwt')
    const onboardingId = Cookies.get('onboardingId')
    const isValidated = await validate()

    //Building Onboarding businessCardInfo form data
    const { businessCardInfo } = await onboarding

    //Checking Empty Fields (must be inside the then() function)
    const rawPhones = await getRawPhone(formInfo)

    const formsPercentCompletion = await filterCompletedForms(
      userAuth.forms,
      'businessCardInfo',
      isValidated.length > 0
    )

    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          businessCardInfo: { ...formInfo, ...rawPhones, isFormComplete: false, firstSaveComplete: true }
        }
      } else {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          businessCardInfo: { ...formInfo, ...rawPhones, isFormComplete: true, firstSaveComplete: true }
        }
      }
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating form info...' })

    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboardingId}`, formObj(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(async (res) => res.data)
      .catch((err) => {
        // eslint-disable-next-line no-console
        setProcessingStatus({ status: 'error', visible: false, message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    setFormInfo({ ...formInfo, ...updatedForm.businessCardInfo })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext('businessCardInfo', updatedForm.businessCardInfo, updatedForm, userAuth)

    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({
        visible: false,
        status: 'success',
        message: 'The business card preference is saved!'
      })
    }
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    setUserAuth({ ...userAuth, lastFormVisited: 'business-card' })
  }, [user])

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

  // Setting Last Form Visited by user to load in the next login
  useEffect(() => {
    const token = Cookies.get('jwt')
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    setLastFormVisited('business-card', onboarding.id, config)
  }, [onboarding])

  useEffect(() => {
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'save' && beforeLeave.route) {
      const e = beforeLeave.event
      updateBusinessCardForm(e)
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

      <Container>
        <Row>
          <Col sm={12}>
            <Row justify="between" align="end">
              <Col sm={12} md={10}>
                <h1 className={style.ax_page_title}>Business Card</h1>
                <h2 className={style.ax_page_subtitle} style={!formInfo.isFormComplete ? { color: 'red' } : {}}>
                  Status:{' '}
                  <span style={{ textTransform: 'uppercase' }}>
                    {formInfo.isFormComplete ? 'Complete' : 'Incomplete'}
                  </span>{' '}
                </h2>

                {fieldsValidation.length > 0 && formInfo.firstSaveComplete === true ? (
                  <section className={style.validation}>
                    <h3>The following fields are Required:</h3>
                    <ul>
                      {fieldsValidation.map((f) => (
                        <li>{f.label}</li>
                      ))}
                    </ul>
                  </section>
                ) : (
                  ''
                )}
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={12}>
                <form className={style.ax_form} ref={form}>
                  <Row>
                    <Col sm={12}>
                      <p>
                        The business card provided by Indi is a NFC card, which will contain all your contact
                        information digitally. You can transfer your contact information to a phone by approximating
                        your card to the phone, and it will add your data as a new contact to that phone.
                      </p>
                      <p>
                        Paper Business Cards only upon request by email:{' '}
                        <a href="mailto:tanya.appel@indimortgage.ca" target="_blank">
                          tanya.appel@indimortgage.ca
                        </a>
                        .
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12} md={12}>
                      <FormSectionTitle title="Opt In" icon={<UilTimesCircle size={28} />} />

                      <div className={style.ax_field}>
                        <label htmlFor="businessCardOptOut">
                          Do you require a Business Card? <span>*</span>
                        </label>

                        <p ref={fieldWrapper} className={`${formstyle.checkboxRow} ${isValid('businessCardOptOut')}`}>
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo && formInfo.businessCardOptOutNo === 'Yes'}
                              id="businessCardOptOutNo"
                              name="businessCardOptOutNo"
                              value={formInfo && formInfo.businessCardOptOutNo}
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                            Yes
                          </span>{' '}
                          <span className={style.checkbox}>
                            <input
                              checked={formInfo && formInfo.businessCardOptOutYes === 'Yes'}
                              id="businessCardOptOutYes"
                              name="businessCardOptOutYes"
                              value={formInfo && formInfo.businessCardOptOutYes}
                              type="checkbox"
                              onChange={(e) => updateFormInfo(e, null)}
                            />
                            No
                          </span>{' '}
                        </p>
                      </div>

                      {formInfo.businessCardOptOut ? (
                        <h2 style={{ color: '#000' }}>
                          Opting out? Please ensure your cards are compliant. You must acquire approval from the
                          brokerage prior to use.
                        </h2>
                      ) : (
                        ''
                      )}
                    </Col>
                  </Row>
                </form>

                {(userAuth &&
                  userAuth.forms &&
                  userAuth.forms.businessCardInfo &&
                  userAuth.forms.isLocked === false &&
                  !userAuth.forms.businessCardInfo.firstSaveComplete) ||
                (userAuth && userAuth.forms && userAuth.forms.isLocked === false && !userAuth.forms.isFormSaved) ? (
                  <div className={style.ax_field}>
                    <Button
                      id="form"
                      name="generate"
                      action={(e) => updateBusinessCardForm(e)}
                      color="highlight"
                      label={onboarding && onboarding.businessCardInfo.firstSaveComplete ? 'Update Form' : 'Save Form'}
                      align="right"
                    />
                  </div>
                ) : (
                  unlockMessage()
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        {userAuth &&
        userAuth.forms &&
        userAuth.forms.isFormSaved &&
        userAuth.forms.businessCardInfo &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.businessCardInfo.isFormComplete ? (
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

    return {
      props: {
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

export default BusinessCardInfo
