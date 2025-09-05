import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import nookies from 'nookies'
import Cookies from 'js-cookie'
import AuthContext from '../../context/authContext'
import { UilFileDownload, UilWindow } from '@iconscout/react-unicons'
import { Container, Row, Col } from 'react-grid-system'
import { serializeJson } from '../../helpers/serializeData'
import { Validation } from '../../helpers/validateFields'
import {
  checkValues,
  updateFormsInContext,
  checkPreviousData,
  filterCompletedForms,
  setLastFormVisited
} from '../../helpers/savingForms'
import formatUrl from '../../helpers/formatUrl'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import NextPrevFooter from '../../components/NextPrevFooter'
import loaderPosition from '../../helpers/loaderScrollPosition'
import Processing from '../../components/Processing'
import FormSectionTitle from '../../components/FormSectionTitle'
import style from '../../styles/Profile.module.scss'
import formstyle from '../../styles/Forms.module.scss'

const WebsiteInformation = (props) => {
  const { onboarding } = props
  const [formInfo, setFormInfo] = useState(onboarding.websiteInfo)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [beforeLeave, setBeforeLeave] = useState(null)
  const [switchers, setSwitchers] = useState({})
  const [repeaterIndex, setRepeaterIndex] = useState({ counter: 0, status: null })
  const [repeaterFields, setRepeaterFields] = useState([])
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const form = useRef()
  const priorWebsiteWrapper = useRef()
  const websiteOptInWrapper = useRef()
  const repeaterFieldsRef = useRef()
  const user = userAuth.userInfo
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

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

  let requiredFields = []

  const setRequiredFields = () => {
    if (formInfo && formInfo.websiteOptIn === true) {
      if (formInfo && formInfo.priorWebsite === true) {
        requiredFields = ['websiteOptIn', 'priorWebsite']
      } else {
        requiredFields = ['websiteOptIn', 'priorWebsite']
      }
    } else {
      if (formInfo && formInfo.priorWebsite === true) {
        requiredFields = ['websiteOptIn', 'priorWebsite']
      } else {
        requiredFields = ['websiteOptIn', 'priorWebsite']
      }
    }
  }

  setRequiredFields()

  //Form Status and Fields Validation
  const validate = (fields) => {
    const validation = Validation(fields, requiredFields, null, null)
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

  const updateSitesInfo = (e, index) => {
    let { name } = e.target
    let { value } = e.target
    let { id } = e.target
    let nameStart
    const currentItem = repeaterFieldsRef.current.querySelector(`#${id}`)

    nameStart = currentItem.getAttribute('dataNameStart')
    index = currentItem.getAttribute('dataIndex')

    if (id === `keepInUseYes${index}`) {
      repeaterFieldsRef.current.querySelector(`#keepInUseNo${index}`).checked = false
    }
    if (id === `keepInUseNo${index}`) {
      repeaterFieldsRef.current.querySelector(`#keepInUseYes${index}`).checked = false
      repeaterFieldsRef.current.querySelector(`#redirectYes${index}`).checked = false
      repeaterFieldsRef.current.querySelector(`#redirectNo${index}`).checked = true
    }

    if (id === `redirectYes${index}`) {
      if (formInfo.websiteOptIn === false) {
        repeaterFieldsRef.current.querySelector(`#redirectNo${index}`).checked = true
        repeaterFieldsRef.current.querySelector(`#redirectYes${index}`).checked = false
      } else {
        repeaterFieldsRef.current.querySelector(`#redirectNo${index}`).checked = false
        repeaterFieldsRef.current.querySelector(`#keepInUseYes${index}`).checked = true
        repeaterFieldsRef.current.querySelector(`#keepInUseNo${index}`).checked = false
      }
    }

    if (id === `redirectNo${index}`) {
      repeaterFieldsRef.current.querySelector(`#redirectYes${index}`).checked = false
    }

    const domFields = repeaterFieldsRef.current.childNodes
    const fieldsArr = Array.from(domFields)

    const currFieldsObj = fieldsArr.map((f, i) => {
      const domain = f.querySelector(`#priorWebsitesUse${i}`).value
      const useYes = f.querySelector(`#keepInUseYes${i}`).checked
      const useNo = f.querySelector(`#keepInUseNo${i}`).checked
      const redirectYes = f.querySelector(`#redirectYes${i}`).checked
      const redirectNo = f.querySelector(`#redirectNo${i}`).checked
      const idx = f.querySelector(`#keepInUseNo${i}`).getAttribute('dataIndex')

      const use = () => {
        if (useYes === true || useYes === 'true') {
          return true
        }
        if (useNo === true || useNo === 'true') {
          return false
        }
      }

      const redirect = () => {
        if (redirectYes === true || redirectYes === 'true') {
          return true
        }
        if (redirectNo === true || redirectNo === 'true') {
          return false
        }
      }

      // Apply formatUrl to the domain
      const formattedDomain = domain ? formatUrl(domain) : ''
      return { domain: formattedDomain, keepInUse: use(), index: idx, redirect: redirect() }
    })

    setFormInfo({ ...formInfo, priorWebsitesUse: currFieldsObj })

    setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
  }

  const updateFormInfo = (e, index) => {
    let { name } = e.target
    let { value } = e.target
    let { id } = e.target

    if (
      name === 'websiteDomainName' ||
      name === 'facebook' ||
      name === 'instagram' ||
      name === 'linkedin' ||
      name === 'twitter' ||
      name === 'youtube'
    ) {
      value = formatUrl(e.target.value)
    }

    if (id === 'websiteOptInYes' || id === 'websiteOptInNo') {
      websiteOptInWrapper.current.classList.remove(style.inputDanger)
    }

    if (id === 'priorWebsiteYes' || id === 'priorWebsiteNo') {
      priorWebsiteWrapper.current.classList.remove(style.inputDanger)
    }

    if (e.target.type === 'checkbox') {
      if (
        (e.target.name === 'websiteOptInNo' && e.target.checked === true) ||
        (e.target.name === 'websiteOptInNo' && e.target.checked === 'true')
      ) {
        name = 'websiteOptIn'
        value = false
      } else if (
        (e.target.name === 'websiteOptInYes' && e.target.checked === true) ||
        (e.target.name === 'websiteOptInYes' && e.target.checked === 'true')
      ) {
        name = 'websiteOptIn'
        value = true
      } else if (
        (e.target.name === 'priorWebsiteNo' && e.target.checked === true) ||
        (e.target.name === 'priorWebsiteNo' && e.target.checked === 'true')
      ) {
        name = 'priorWebsite'
        value = false
      } else if (
        (e.target.name === 'priorWebsiteYes' && e.target.checked === true) ||
        (e.target.name === 'priorWebsiteYes' && e.target.checked === 'true')
      ) {
        name = 'priorWebsite'
        value = true
      } else if (
        (e.target.name === 'additionalDomainsNo' && e.target.checked === true) ||
        (e.target.name === 'additionalDomainsNo' && e.target.checked === 'true')
      ) {
        name = 'additionalDomains'
        value = false
      } else if (
        (e.target.name === 'additionalDomainsYes' && e.target.checked === true) ||
        (e.target.name === 'additionalDomainsYes' && e.target.checked === 'true')
      ) {
        name = 'additionalDomains'
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

    if (e.target.id === 'ownDomain' || e.target.id === 'providedDomain') {
      value = e.target.checked

      if (e.target.id === 'ownDomain') {
        setSwitchers({ ...switchers, ownDomain: value, providedDomain: !value })
        setFormInfo({ ...formInfo, ownDomain: value, providedDomain: !value })
      } else if (e.target.id === 'providedDomain') {
        setSwitchers({ ...switchers, ownDomain: !value, providedDomain: value })
        setFormInfo({ ...formInfo, ownDomain: !value, providedDomain: value })
      } else {
        setSwitchers({ ...switchers, [name]: value, ownDomain: false, providedDomain: false })
        setFormInfo({ ...formInfo, [name]: value, ownDomain: false, providedDomain: false })
      }
    } else {
      setFormInfo({ ...formInfo, [name]: value })
    }

    if (name === 'websiteDomainRegistrar' && value === 'other') {
      setFormInfo({ ...formInfo, otherRegistrar: true })
    }

    if (
      userAuth.forms.isFormSaved === true ||
      userAuth.forms.isFormSaved === undefined ||
      userAuth.forms.isFormSaved === null
    ) {
      setUserAuth({ ...userAuth, forms: { ...userAuth.forms, isFormSaved: false } })
    }
  }

  //UPDATING THE FORM
  const updateWebsiteInfoForm = async (e) => {
    e.preventDefault()
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating broker information' })

    const token = Cookies.get('jwt')
    const onboardingId = Cookies.get('onboardingId')

    const newFormInfo = () => {
      let fields = {}
      for (let i in formInfo) {
        if (i !== '_id' && i !== '__v') {
          fields = { ...fields, [i]: formInfo[i] }
        }
      }
      return fields
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating onboarding profile' })

    await axios
      .put(`${apiUrl}/users/${user.id}`, newFormInfo(), {
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
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    // Fetch the website associated with the user and update it
    try {
      setProcessingStatus({ ...processingStatus, visible: true, message: 'Fetching website information' })

      // Fetch the website information using user ID
      const websiteResponse = await axios.get(`${apiUrl}/websites/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (websiteResponse.data && websiteResponse.data.id) {
        const websiteId = websiteResponse.data.id

        // Extract fields to be saved to the website entity
        const websiteFields = {
          websiteOptIn: formInfo.websiteOptIn,
          ownDomain: formInfo.ownDomain,
          providedDomain: formInfo.providedDomain,
          websiteDomainRegistrar: formInfo.websiteDomainRegistrar,
          secondaryWebsite: formInfo.secondaryWebsite,
          additionalDomainNames: formInfo.additionalDomainNames,
          googleTag: formInfo.googleTag,
          facebookPixelTag: formInfo.facebookPixelTag,
          googleWebsiteVerification: formInfo.googleWebsiteVerification,
          googleTagManagerInHead: formInfo.googleTagManagerInHead,
          googleTagManagerInBody: formInfo.googleTagManagerInBody,
          thirdPartyScriptTag: formInfo.thirdPartyScriptTag,
          chatWidgetCode: formInfo.chatWidgetCode,
          reviewWidgetCode: formInfo.reviewWidgetCode
        }

        setProcessingStatus({ ...processingStatus, visible: true, message: 'Updating website information' })

        // Update the website entity
        await axios.put(`${apiUrl}/websites/${websiteId}`, websiteFields, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error handling website entity:', err)
      // Continue with form submission even if website operations fail
    }

    //Building Onboarding WebsiteInfo form data
    const { websiteInfo } = await onboarding

    // --- Format relevant fields before validation ---
    const fieldsToValidate = { ...formInfo } // Create a copy
    if (fieldsToValidate.websiteDomainName) {
      fieldsToValidate.websiteDomainName = formatUrl(fieldsToValidate.websiteDomainName)
    }
    if (fieldsToValidate.priorWebsitesUse && Array.isArray(fieldsToValidate.priorWebsitesUse)) {
      fieldsToValidate.priorWebsitesUse = fieldsToValidate.priorWebsitesUse.map((site) => ({
        ...site,
        domain: site.domain ? formatUrl(site.domain) : ''
      }))
    }
    // --- End formatting ---

    const isValidated = await validate(fieldsToValidate) // Pass formatted fields to validation

    if (isValidated.length > 0) {
      setProcessingStatus({ visible: false, status: '', message: '' })
      window.scroll({ top: 0, left: 0, behavior: 'smooth' })
      return
    }

    const formsPercentCompletion = await filterCompletedForms(userAuth.forms, 'websiteInfo', isValidated.length > 0)

    const formObj = () => {
      if (isValidated.length > 0) {
        return {
          completionPercent: formsPercentCompletion,
          isSubmited: false,
          websiteInfo: { ...formInfo, isFormComplete: false, firstSaveComplete: true }
        }
      }
      return {
        completionPercent: formsPercentCompletion,
        isSubmited: false,
        websiteInfo: { ...formInfo, isFormComplete: true, firstSaveComplete: true }
      }
    }

    setProcessingStatus({ ...processingStatus, visible: true, message: 'Saving form' })
    const updatedForm = await axios
      .put(`${apiUrl}/onboarding-processes/${onboardingId}`, formObj(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(async (res) => {
        return res.data
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        setProcessingStatus({ visible: false, status: 'error', message: `Error: ${err}` })
        console.log(err)
        throw err
      })

    setFormInfo({ ...formInfo, ...updatedForm.websiteInfo })

    //Updating form in Context
    const updatedCtxForm = updateFormsInContext('websiteInfo', updatedForm.websiteInfo, updatedForm, userAuth)
    setUserAuth(updatedCtxForm)

    if (updatedForm.completionPercent === 100 || updatedForm.completionPercent === '100') {
      router.push('/finished')
    } else {
      setProcessingStatus({ status: 'success', visible: false, message: 'Website information form saved!' })
    }
  }

  const additionalDomainFields = (e, index) => {
    e.preventDefault()
    const newField = () => (
      <Row key={`repeater-new-${index}`}>
        <Col sm={12} md={4}>
          <div className={style.ax_field}>
            <label htmlFor="priorWebsitesUse">
              Domain <span>*</span>
            </label>

            <p className={formstyle.checkboxRow}>
              <span className={style.checkbox}>
                <input
                  type="text"
                  dataIndex={index}
                  dataNameStart="priorWebsitesUse"
                  name={`priorWebsitesUse${index}`}
                  id={`priorWebsitesUse${index}`}
                  placeholder="www.myname.ca"
                  onChange={(e, index) => updateSitesInfo(e, index)}
                  className={isValid(`priorWebsitesUse_${index}`)}
                />
              </span>
            </p>
          </div>
        </Col>
        <Col sm={12} md={3}>
          <div className={style.ax_field}>
            <label htmlFor="keepInUse">
              Keep in use? <span>*</span>
            </label>
            <p>
              <span className={style.checkbox}>
                <input
                  dataIndex={index}
                  dataNameStart="keepInUseYes"
                  id={`keepInUseYes${index}`}
                  name={`keepInUseYes${index}`}
                  type="checkbox"
                  onChange={(e, index) => updateSitesInfo(e, index)}
                />
                Yes
              </span>{' '}
              <span className={style.checkbox}>
                <input
                  dataIndex={index}
                  dataNameStart="keepInUseNo"
                  id={`keepInUseNo${index}`}
                  name={`keepInUseNo${index}`}
                  type="checkbox"
                  onChange={(e, index) => updateSitesInfo(e, index)}
                />
                No
              </span>{' '}
            </p>
          </div>
        </Col>
        <Col sm={12} md={4}>
          <div className={style.ax_field}>
            <label htmlFor="redirect">
              Redirect to your Indi website? <span>*</span>
            </label>
            <p>
              <span className={style.checkbox}>
                <input
                  dataIndex={index}
                  dataNameStart="redirectYes"
                  id={`redirectYes${index}`}
                  name={`redirectYes${index}`}
                  type="checkbox"
                  onChange={(e, index) => updateSitesInfo(e, index)}
                />
                Yes
              </span>{' '}
              <span className={style.checkbox}>
                <input
                  dataIndex={index}
                  dataNameStart="redirectNo"
                  id={`redirectNo${index}`}
                  name={`redirectNo${index}`}
                  type="checkbox"
                  onChange={(e, index) => updateSitesInfo(e, index)}
                />
                No
              </span>{' '}
            </p>
            {formInfo && formInfo.websiteOptIn === false ? (
              <p style={{ color: 'red', fontSize: '9px' }}>
                <strong>It is not possible to redirect while you are not using an Indi WebSite.</strong>
              </p>
            ) : (
              ''
            )}
          </div>
        </Col>
      </Row>
    )

    setRepeaterFields([...repeaterFields, newField()])
  }

  const updateRepeater = (e) => {
    setRepeaterIndex({ counter: parseInt(repeaterIndex.counter) + 1, status: 'addButton' })
    additionalDomainFields(e, parseInt(repeaterIndex.counter))
  }

  const setInitialRepeaterFields = (from) => {
    if (from === 'initial') {
      if (repeaterIndex && repeaterIndex.counter && parseInt(repeaterIndex.counter) > 0) {
        const itemsArr = []

        const websites = onboarding.websiteInfo.priorWebsitesUse

        for (let i = 0; i < websites.length; i++) {
          let index = websites[i].index
          let domain = websites[i].domain
          let keepInUse = websites[i].keepInUse
          let redirect = websites[i].redirect
          itemsArr.push(
            <Row key={`repeater-initial-${index}`}>
              <Col sm={12} md={4}>
                <div className={style.ax_field}>
                  <label htmlFor="priorWebsitesUse">
                    Domain <span>*</span>
                  </label>

                  <p className={formstyle.checkboxRow}>
                    <span className={style.checkbox}>
                      <input
                        type="text"
                        dataIndex={index}
                        dataNameStart="priorWebsitesUse"
                        name={`priorWebsitesUse${index}`}
                        id={`priorWebsitesUse${index}`}
                        placeholder="www.myname.ca"
                        onChange={(e, index) => updateSitesInfo(e, index)}
                        defaultValue={domain}
                        className={isValid(`priorWebsitesUse_${index}`)}
                      />
                    </span>
                  </p>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={style.ax_field}>
                  <label htmlFor="keepInUse">
                    Keep in use? <span>*</span>
                  </label>
                  <p>
                    <span className={style.checkbox}>
                      <input
                        dataIndex={index}
                        dataNameStart="keepInUseYes"
                        id={`keepInUseYes${index}`}
                        name={`keepInUseYes${index}`}
                        type="checkbox"
                        onChange={(e, index) => updateSitesInfo(e, index)}
                        defaultChecked={keepInUse === true ? true : false}
                      />
                      Yes
                    </span>{' '}
                    <span className={style.checkbox}>
                      <input
                        dataIndex={index}
                        dataNameStart="keepInUseNo"
                        id={`keepInUseNo${index}`}
                        name={`keepInUseNo${index}`}
                        type="checkbox"
                        onChange={(e, index) => updateSitesInfo(e, index)}
                        defaultChecked={keepInUse === true ? false : true}
                      />
                      No
                    </span>{' '}
                  </p>
                </div>
              </Col>
              <Col sm={12} md={4}>
                <div className={style.ax_field}>
                  <label htmlFor="redirect">
                    Redirect to your Indi website? <span>*</span>
                  </label>
                  <p>
                    <span className={style.checkbox}>
                      <input
                        dataIndex={index}
                        dataNameStart="redirectYes"
                        id={`redirectYes${index}`}
                        name={`redirectYes${index}`}
                        type="checkbox"
                        onChange={(e, index) => updateSitesInfo(e, index)}
                        checked={redirect === true ? true : false}
                      />
                      Yes
                    </span>{' '}
                    <span className={style.checkbox}>
                      <input
                        dataIndex={index}
                        dataNameStart="redirectNo"
                        id={`redirectNo${index}`}
                        name={`redirectNo${index}`}
                        type="checkbox"
                        onChange={(e, index) => updateSitesInfo(e, index)}
                        checked={redirect === true ? false : true}
                      />
                      No
                    </span>{' '}
                  </p>
                  {formInfo && formInfo.websiteOptIn === false ? (
                    <p style={{ color: 'red', fontSize: '9px' }}>
                      <strong>It is not possible to redirect while you are not using an Indi WebSite.</strong>
                    </p>
                  ) : (
                    ''
                  )}
                </div>
              </Col>
            </Row>
          )
        }

        setRepeaterFields(itemsArr)
      }
    }
  }

  //--------EFFECTS (Lifecycle Actions) --------------

  //On user loaded or changed
  useEffect(() => {
    if (user) {
      setSwitchers({
        ...switchers,
        // websiteOptIn: user && user.websiteOptIn ? user.websiteOptIn : true,
        ownDomain: user && user.ownDomain ? user.ownDomain : false,
        providedDomain: user && user.providedDomain ? user.providedDomain : true,
        additionalDomains: user && user.additionalDomains ? user.additionalDomains : ''
      })
    }

    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }

    setUserAuth({
      ...userAuth,
      lastFormVisited: 'website-information'
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
    setLastFormVisited('website-information', onboarding.id, config)

    if (onboarding.websiteInfo) {
      const { websiteInfo } = onboarding
      if (websiteInfo && websiteInfo.priorWebsitesUse && websiteInfo.priorWebsitesUse.length > 0) {
        setRepeaterIndex({ counter: websiteInfo.priorWebsitesUse.length, status: 'initial' })
      }
    }
  }, [onboarding])

  useEffect(() => {
    if (parseInt(repeaterIndex.counter) > 0) {
      setInitialRepeaterFields(repeaterIndex.status)
    }
  }, [repeaterIndex])

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
    if (form && form.current !== null && form.current !== undefined) {
      const current = form.current
      const obj = checkValues(current, requiredFields)
      setFormInfo({ ...formInfo, ...obj })
    }
  }, [formInfo.ownDomain, formInfo.priorWebsite, formInfo.websiteOptIn])

  useEffect(() => {
    if (beforeLeave && beforeLeave.action && beforeLeave.action === 'save' && beforeLeave.route) {
      const e = beforeLeave.event
      updateWebsiteInfoForm(e)
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
                <h1 className={style.ax_page_title}>Indi Website Information</h1>
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
              <Col sm={12} md={2} style={{ marginBottom: '16px' }}>
                <Button
                  icon={<UilFileDownload />}
                  disabled={formInfo.isFormComplete ? false : true}
                  align="right"
                  color="highlight"
                  action={() => PdfGenerator('button', 'websiteInformation', null, formInfo, user)}
                  label="PDF"
                />
              </Col>
            </Row>

            <form className={style.ax_form} ref={form}>
              <Row>
                <Col sm={12} md={12}>
                  <FormSectionTitle title="Indi Website & Domain" icon={<UilWindow size={28} />} />
                </Col>
                <Col sm={12} md={12}>
                  <div className={style.ax_field}>
                    <label htmlFor="websiteOptIn">
                      Do you want an Indi Website? <span>*</span>
                    </label>

                    <p ref={websiteOptInWrapper} className={isValid('websiteOptIn')}>
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.websiteOptIn === 'Yes') ||
                            (formInfo && formInfo.websiteOptIn === true)
                          }
                          id="websiteOptInYes"
                          name="websiteOptInYes"
                          value={formInfo && formInfo.websiteOptInYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.websiteOptIn === 'No') ||
                            (formInfo && formInfo.websiteOptIn === false)
                          }
                          id="websiteOptInNo"
                          name="websiteOptInNo"
                          value={formInfo && formInfo.websiteOptInNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                    </p>
                  </div>
                </Col>
              </Row>

              {formInfo.websiteOptIn ? (
                <Row>
                  <Col>
                    <div className={style.ax_field}>
                      <label htmlFor="ownDomain">
                        Which kind website address (domain name) would you like to use on your Indi Website?{' '}
                      </label>
                      <p className={formstyle.checkboxRow}>
                        <span className={style.checkbox}>
                          <input
                            type="checkbox"
                            name="ownDomain"
                            id="ownDomain"
                            checked={formInfo.ownDomain}
                            onChange={(e) => updateFormInfo(e)}
                            defaultValue={checkPreviousData('websiteInfo', 'ownDomain', user, onboarding)}
                          />
                          My Own Domain
                        </span>

                        <span className={style.checkbox}>
                          <input
                            type="checkbox"
                            name="providedDomain"
                            id="providedDomain"
                            checked={formInfo.providedDomain}
                            onChange={(e) => updateFormInfo(e)}
                            defaultValue={checkPreviousData('websiteInfo', 'providedDomain', user, onboarding)}
                          />
                          A Domain Provided By Indi
                        </span>
                      </p>
                    </div>
                  </Col>
                </Row>
              ) : (
                ''
              )}

              {formInfo && formInfo.ownDomain && formInfo.websiteOptIn ? (
                <>
                  <Row>
                    <Col sm={12} md={4}>
                      <div className={style.ax_field}>
                        <label htmlFor="websiteDomainName">What is your domain name?</label>
                        <input
                          type="text"
                          name="websiteDomainName"
                          id="websiteDomainName"
                          placeholder="www.myname.ca"
                          defaultValue={checkPreviousData('websiteInfo', 'websiteDomainName', user, onboarding)}
                          onChange={(e) => updateFormInfo(e)}
                          className={isValid('websiteDomainName')}
                        />
                      </div>
                    </Col>

                    {formInfo && !formInfo.otherRegistrar ? (
                      <Col sm={12} md={4}>
                        <div className={style.ax_field}>
                          <label htmlFor="websiteDomainRegistrar">Where is it registered?</label>
                          <select
                            id="websiteDomainRegistrar"
                            name="websiteDomainRegistrar"
                            onChange={(e) => updateFormInfo(e)}
                            defaultValue={
                              user || onboarding
                                ? checkPreviousData('websiteInfo', 'websiteDomainRegistrar', user, onboarding)
                                : ''
                            }
                          >
                            <option value="Select">Select</option>
                            <option value="GoDaddy">GoDaddy</option>
                            <option value="Namecheap">Namecheap</option>
                            <option value="Reg.ca">Reg.ca</option>
                            <option value="Rebel">Rebel</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </Col>
                    ) : (
                      ''
                    )}

                    <Col sm={12} md={4}>
                      <div className={style.ax_field}>
                        {formInfo && formInfo.otherRegistrar ? (
                          <>
                            <label>Registrar Company (i.e. GoDaddy):</label>
                            <input
                              type="text"
                              name="websiteDomainRegistrar"
                              id="websiteDomainRegistrar"
                              placeholder="myname.ca"
                              defaultValue={checkPreviousData(
                                'websiteInfo',
                                'websiteDomainRegistrar',
                                user,
                                onboarding
                              )}
                              onChange={(e) => updateFormInfo(e)}
                            />
                          </>
                        ) : (
                          ''
                        )}
                      </div>
                    </Col>

                    <Col sm={12} md={12}>
                      <div className={style.ax_field} style={{ marginBottom: '16px' }}>
                        <p htmlFor="websiteDomainRegistrar">
                          <strong>
                            In order to point your domain to your new Indi website, our IT team will need to have access
                            to your domain to change your domain DNS Records. Please check the{' '}
                            <a href="/tutorials/giving-domain-access" target="_blank">
                              Giving Domain Access
                            </a>{' '}
                            tutorial.
                          </strong>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </>
              ) : (
                ''
              )}

              <Row>
                <Col sm={12} md={12}>
                  <div className={style.ax_field}>
                    <label htmlFor="priorWebsite">
                      Do you have any existing mortgage related websites? Please list all domains below? <span>*</span>
                    </label>

                    <p ref={priorWebsiteWrapper} className={isValid('priorWebsite')}>
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.priorWebsite === 'Yes') ||
                            (formInfo && formInfo.priorWebsite === true)
                          }
                          id="priorWebsiteYes"
                          name="priorWebsiteYes"
                          value={formInfo && formInfo.priorWebsiteYes}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        Yes
                      </span>{' '}
                      <span className={style.checkbox}>
                        <input
                          checked={
                            (formInfo && formInfo.priorWebsite === 'No') ||
                            (formInfo && formInfo.priorWebsite === false)
                          }
                          id="priorWebsiteNo"
                          name="priorWebsiteNo"
                          value={formInfo && formInfo.priorWebsiteNo}
                          type="checkbox"
                          onChange={(e) => updateFormInfo(e, null)}
                        />
                        No
                      </span>{' '}
                    </p>
                  </div>
                </Col>
              </Row>

              {formInfo && formInfo.priorWebsite ? (
                <>
                  <Row>
                    <Col sm={12} md={12}>
                      <h2>What are the websites domains?</h2>
                    </Col>
                  </Row>

                  <Row style={{ marginBottom: '32px' }}>
                    <Col>
                      <section ref={repeaterFieldsRef}>{repeaterFields}</section>
                      <Button label="Add Domain" sizing="small" color="highlight" action={(e) => updateRepeater(e)} />
                    </Col>
                  </Row>
                </>
              ) : (
                ''
              )}
            </form>

            {(userAuth &&
              userAuth.forms &&
              userAuth.forms.websiteInfo &&
              userAuth.forms.isLocked === false &&
              !userAuth.forms.websiteInfo.firstSaveComplete) ||
            (userAuth && userAuth.forms && userAuth.forms.isLocked === false && !userAuth.forms.isFormSaved) ? (
              <Row justify="end">
                <Col sm={12} md={4}>
                  <Row direction="column">
                    <Col sm={12}>
                      <div className={style.ax_field}>
                        <Button
                          id="form"
                          name="generate"
                          action={(e) => updateWebsiteInfoForm(e)}
                          color="highlight"
                          label={onboarding && onboarding.firstSaveComplete ? 'Update Form' : 'Save Form'}
                          align="right"
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
        userAuth.forms.websiteInfo &&
        userAuth.forms.isLocked === false &&
        userAuth.forms.websiteInfo.isFormComplete ? (
          <NextPrevFooter />
        ) : (
          ' '
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

export default WebsiteInformation
