import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Row, Col, Container } from 'react-grid-system'
import nookies from 'nookies'
import axios from 'axios'
import Layout from '../components/Layout'
import Button from '../components/Button'
import AuthContext from '../context/authContext'
import style from '../styles/Dashboard.module.scss'

const Dashboard = (props) => {
  const { user, onboarding } = props
  const router = useRouter()
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const [userInfo, setUserInfo] = useState(null)
  const [fieldsValidation, setFieldsValidation] = useState([])
  const [lastForm, setLastForm] = useState(null)

  console.log('onboarding', onboarding)

  const brokerInfoFormValidation = () => {
    const fields = [
      'firstname',
      'lastname',
      'workEmail',
      'position',
      'address',
      'city',
      'province',
      'postalCode',
      'phone',
      'cellPhone',
      'emergencyContact',
      'emergencyPhone',
      'birthdate',
      'sin',
      'startDate'
    ]

    const filteredFields = () => {
      const filtered = []
      for (const f in user) {
        fields.forEach((vf) => {
          if ((vf === f && user[f] === null) || (vf === f && user[f] === '') || (vf === f && user[f] === undefined)) {
            filtered.push(f)
          }
        })
      }
      return filtered
    }

    if (filteredFields().length > 0) {
      const validatedFields = filteredFields()
      const fieldsMessages = validatedFields.map((f) => {
        switch (f) {
          case 'firstname':
            return 'First Name'
          case 'lastname':
            return 'Last Name'
          case 'workEmail':
            return 'Work Email'
          case 'position':
            return 'Position'
          case 'address':
            return 'Address'
          case 'city':
            return 'City'
          case 'province':
            return 'Province'
          case 'postalCode':
            return 'Postal Code'
          case 'phone':
            return 'Work Phone'
          case 'cellPhone':
            return 'Cell Phone'
          case 'emergencyContact':
            return 'Emergency Contact'
          case 'emergencyPhone':
            return 'Emergency Phone'
          case 'birthdate':
            return 'Birth Date'
          case 'sin':
            return 'SIN'
          case 'startDate':
            return 'Start Date'
          default:
            return ''
        }
      })

      if (fieldsMessages.length > 0) {
        setFieldsValidation(fieldsMessages)
      }
    }
  }

  const welcomeMessage = () => {
    if (userInfo && parseInt(userInfo.loginCount) >= 0 && parseInt(userInfo.loginCount) < 2) {
      return <h3>Indi Onboarding</h3>
    } else {
      if (userInfo && userInfo.firstname) {
        return <h3>{userInfo.firstname}, welcome back!</h3>
      } else {
        return <h3>Indi Onboarding - Welcome!</h3>
      }
    }
  }

  const lastFormOpened = (form) => {
    if (form && form !== null && form !== undefined) {
      return setLastForm(form)
    } else {
      if (user && user.licensed === false) {
        return setLastForm('unlicensed-information')
      } else {
        return setLastForm('broker-information')
      }
    }
  }

  useEffect(() => {
    setUserInfo(userAuth.userInfo)
  }, [userAuth])

  useEffect(() => {
    if (onboarding && onboarding.lastFormVisited) {
      lastFormOpened(onboarding.lastFormVisited)
    } else {
      if (user && user.licensed === false) {
        lastFormOpened('unlicensed-information')
      } else {
        lastFormOpened('broker-information')
      }
    }
  }, [onboarding])

  useEffect(() => {
    brokerInfoFormValidation()
    if (router.query.code) {
      setUserAuth({
        ...userAuth,
        signing: {
          authCode: router.query.code
        }
      })
    }
  }, [])

  return (
    <Layout fullpage toast={{ showToast: false, message: '' }}>
      <Container className={style.content}>
        <Row justify="center">
          <Col xs={7} sm={12} md={12} lg={10} xl={8} xxl={8}>
            <div className={style.banner}>
              <img src="./images/bg-welcome.jpg" alt="dashboard banner" />
            </div>
          </Col>
        </Row>
        <Row justify="center">
          <Col sm={10}>
            <article className={`${style.textCenter}`}>
              {welcomeMessage()}
              <p className={style.textCenter}>
                Welcome to your digital onboarding experience. Please take a few minutes to fill out the information
                required to complete your transition to Indi. This information is necessary in adhering to regulatory
                compliance, lender set up and marketing (both initial and ongoing).
              </p>
              <p className={style.textCenter}>
                You may fill in the forms in any order, start a form and finish it later and edit at any time…however,
                the quicker you are in completing the forms, the quicker we can be to getting you on your way to doing
                the fun stuff - helping your clients!
              </p>
            </article>
            <Row justify="center">
              <Col sm={12} md={5} lg={5} xlg={4}>
                <Button
                  isCentered
                  color="highlight"
                  isLink
                  sizing="xlarge"
                  linkPath={`webforms/${lastForm}`}
                  label={
                    userInfo && parseInt(userInfo.loginCount) >= 0 && parseInt(userInfo.loginCount) < 2
                      ? 'Start Here!'
                      : 'Continue Onboarding!'
                  }
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const tokens = nookies.get(ctx)
  const { jwt, userId, onboardingId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt && onboardingId) {
    const onboarding = await axios
      .get(`${apiUrl}/onboarding-processes/${onboardingId}`, config)
      .then((res) => {
        const form = res.data
        return form
      })
      .catch((err) => {
        throw err
      })

    console.log('FINISHED', Date.now())
    return {
      props: {
        user: onboarding.user ? onboarding.user : null,
        onboarding
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

export default Dashboard
