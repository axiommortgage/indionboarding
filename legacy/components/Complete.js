import { useContext, useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { saveAs } from 'file-saver'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import { Container, Row, Col } from 'react-grid-system'
import { serializeJson } from '../helpers/serializeData'
import { UilMessage, UilFileDownload } from '@iconscout/react-unicons'
import { updateFormsInContext } from '../helpers/savingForms'
import PdfGenerator from '../helpers/pdfGenerator/pdfGenerator'
import axios from 'axios'
import Cookies from 'js-cookie'
import AuthContext from '../context/authContext'
import Button from './Button'
import loaderPosition from '../helpers/loaderScrollPosition'
import Processing from './Processing'
import style from '../styles/Complete.module.scss'

const Complete = (props) => {
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const [processingStatus, setProcessingStatus] = useState({ visible: false, status: '', message: '' })
  const [pdfLinks, setPdfLinks] = useState(null)
  const [employerData, setEmployerData] = useState(null)
  const [allPdfBytes, setAllPdfBytes] = useState([])
  const [user, setUser] = useState(null)
  const [animationData, setAnimationData] = useState(null)
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`
  const EMPLOYER_ID = process.env.EMPLOYER_ID
  const token = Cookies.get('jwt')
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const onboardingId = Cookies.get('onboardingId')
  const { forms } = userAuth

  const fetchEmployerData = async () => {
    await axios
      .get(`${API_URL}/users?id=${EMPLOYER_ID ? EMPLOYER_ID : '604fdb6895bfeeb9e58cae98'}`, config)
      .then((res) => {
        setEmployerData(res.data[0])
        return res.data[0]
      })
      .catch((err) => {
        throw err
      })
  }

  // Helper function to get the correct letter of direction PDF URL
  const getLetterOfDirectionUrl = () => {
    const selectedLetter = userAuth.forms.letterOfDirection?.selectedLetter
    if (selectedLetter && pdfLinks?.letterOfDirection?.[selectedLetter]) {
      return pdfLinks.letterOfDirection[selectedLetter]
    }
    // Fallback to expert
    return pdfLinks?.letterOfDirection?.expert || pdfLinks?.expertLetter || ''
  }

  console.log('userAuth', userAuth)

  const fetchPdfsLinks = async () => {
    const compliance = await axios
      .get(`${API_URL}/documents`, config)
      .then((res) => {
        const cplc = res.data
        const serializedData = serializeJson(cplc)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    const policiesManual = await compliance.systemDocuments.filter(
      (c) => c.policyProcedure === true && c.policyProcedure !== null
    )

    const unlicensedPoliciesManual = await compliance.systemDocuments.filter(
      (c) => c.unlicensedPolicyProcedure === true && c.unlicensedPolicyProcedure !== null
    )


    console.log('unlicensedPoliciesManual', unlicensedPoliciesManual)
    // NEW: Create letter of direction mapping
    const letterOfDirectionDocs = compliance.systemDocuments.filter(
      (c) => c.letterOfDirection !== null && c.letterOfDirection !== undefined
    )
    
    const letterOfDirectionMap = {}
    letterOfDirectionDocs.forEach(doc => {
      letterOfDirectionMap[doc.letterOfDirection] = doc.file.url
    })
    
    // LEGACY: Keep expertLetter for backward compatibility
    const expertLetter = await compliance.systemDocuments.filter(      
      (c) => c.expertLetter === true && c.expertLetter !== null
    )

    return { 
      policiesManual: policiesManual[0].file.url, 
      unlicensedPoliciesManual: unlicensedPoliciesManual[0].file.url,
      expertLetter: expertLetter[0].file.url,
      letterOfDirection: letterOfDirectionMap
    }
  }

  const submitPackage = async () => {
    setProcessingStatus({ ...processingStatus, visible: true, message: 'Submiting Package...' })

    const savedForms = await axios
      .put(
        `${API_URL}/onboarding-processes/${onboardingId}`,
        { isSubmited: true, isLocked: false, submissionDate: new Date() },
        config
      )
      .then((res) => res.data)
      .catch((err) => {
        throw err
      })

    const updatedCtxForm = updateFormsInContext(null, null, savedForms, userAuth, true)
    setUserAuth(updatedCtxForm)

    setProcessingStatus({ ...processingStatus, visible: false, message: 'Submiting Onboarding Package...' })
  }

  useEffect(() => {
    const getLinks = async () => {
      const links = await fetchPdfsLinks()
      setPdfLinks(links)
    }

    const fetchAnimationData = async () => {
      try {
        const response = await fetch('https://assets3.lottiefiles.com/packages/lf20_obhph3sh.json')
        const data = await response.json()
        setAnimationData(data)
      } catch (error) {
        console.error('Failed to load animation:', error)
      }
    }

    getLinks()
    fetchEmployerData()
    fetchAnimationData()
  }, [])

  useEffect(() => {
    if (userAuth && userAuth.userInfo) {
      setUser(userAuth.userInfo)
    }

    if (userAuth && userAuth.forms && userAuth.forms.isSubmited === true) {
      const lockOnboarding = async () => {
        await axios
          .put(`${API_URL}/onboarding-processes/${onboardingId}`, { isLocked: true }, config)
          .then((res) => res.data)
          .catch((err) => {
            throw err
          })
      }
      lockOnboarding()
    }
  }, [userAuth])

  if(!pdfLinks) {
    return <div>Loading...</div>
  }
  
  return (
    <>
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
        <section className={style.bannerContainer}>
          <div className={style.bannerAnim}>
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ height: 'auto', width: '100%', position: 'relative', bottom: 400 }}
              />
            )}
          </div>
          <div className={style.bannerContent}>
            <div className={style.bannerInnerContent}>
              <h1>Wooohooo!!! Congratulations!</h1>
              <h2>You've completed the onboarding package!</h2>
              <p>
                The Indi's is hard at work getting your custom setup at Indi Mortgage ready for your license activation
                at Indi Mortgage. You can expect to hear from a member of the team within 2 business days. Download the
                on-boarding package here for your records.
              </p>
            </div>
          </div>
          {userAuth.forms && userAuth.forms.isSubmited ? (
            <div>
              <h2 className={style.ax_page_subtitle} style={{ marginTop: '56px' }}>
                Please download your forms for your records.
              </h2>

              <Container className={style.list}>
                {forms.brokerInfo ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Broker Information</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator('button', 'brokerInformation', null, userAuth.forms.brokerInfo, user)
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.unlicensedInfo ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Unlicensed Information</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator('button', 'unlicensedInformation', null, userAuth.forms.unlicensedInfo, user)
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.businessCardInfo ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Business Card Information</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator('button', 'businessCardInfo', null, userAuth.forms.businessCardInfo, user)
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.contractAndSchedule ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Contract And Schedule</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator(
                            'button',
                            'contractAndSchedule',
                            null,
                            userAuth.forms.contractAndSchedule,
                            user,
                            employerData
                          )
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.letterOfDirection ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Letter Of Direction</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() => {
                          const url = getLetterOfDirectionUrl()
                          if (url) {
                            window.open(url, '_blank')
                          }
                        }}
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.mpcApplication ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>MPC Application</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator(
                            'button',
                            'mpcApplication',
                            null,
                            userAuth.forms.mpcApplication,
                            user,
                            employerData
                          )
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.paymentAuthorization ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Payment Authorization</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator(
                            'button',
                            'paymentAuthorization',
                            null,
                            userAuth.forms.paymentAuthorization,
                            user,
                            employerData
                          )
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.photos ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Photos</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() => PdfGenerator('button', 'photos', null, userAuth.forms.photos, user, employerData)}
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.policiesAndProcedure ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Policies And Procedure</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator(
                            'button',
                            'policiesAndProcedure',
                            null,
                            userAuth.forms.policiesAndProcedure,
                            user,
                            employerData,
                            pdfLinks.policiesManual
                          )
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.unlicensedPolicies ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Policies And Procedure</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator(
                            'button',
                            'unlicensedPolicies',
                            null,
                            userAuth.forms.unlicensedPolicies,
                            user,
                            employerData,
                            pdfLinks.unlicensedPoliciesManual
                          )
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}

                {forms.websiteInfo ? (
                  <Row style={{ width: '100%' }} className={style.listItem} justify="between" align="center" nogutter>
                    <Col sm={12} md={6} justify="between">
                      <h3>Website Information</h3>
                    </Col>
                    <Col sm={12} md={6}>
                      <Button
                        color="dark"
                        id="downloadForms"
                        action={() =>
                          PdfGenerator('button', 'websiteInformation', null, userAuth.forms.websiteInfo, user)
                        }
                        label="Download Form"
                        icon={<UilFileDownload />}
                        iconPos="right"
                        sizing="medium"
                        align="right"
                      />
                    </Col>
                  </Row>
                ) : (
                  ''
                )}
              </Container>
            </div>
          ) : (
            <Button
              color="dark"
              id="submitForms"
              action={(e) => submitPackage(e)}
              label="Finish and Submit Forms"
              icon={<UilMessage />}
              iconPos="right"
              sizing="large"
            />
          )}
        </section>
      </Container>
    </>
  )
}

export default Complete
