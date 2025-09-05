import { useState, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import { setCookie, getCookie } from 'nookies'
import { UilEye, UilEyeSlash, UilExclamationTriangle } from '@iconscout/react-unicons'
import styles from '../styles/Login.module.scss'
import AuthContext from '../context/authContext'

const Login = () => {
  const route = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')
  // eslint-disable-next-line no-unused-vars
  const { userAuth, setUserAuth } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()

    setProcessing(true)

    const loginInfo = {
      identifier: username,
      password
    }

    const API_URL = await `${process.env.NEXT_PUBLIC_API_URL}/auth/local`
    const UPDATE_URL = process.env.NEXT_PUBLIC_API_URL

    const loginData = await axios
      .post(API_URL, loginInfo)
      .then(async (res) => {
        setProcessing(false)

        const userId = res.data.user.id
        const jwt = res.data.jwt
        const onboardingId = res.data.user.onboardingProcess.id

        setUserAuth({ isAuth: true, userInfo: res.data.user })

        setCookie(null, 'jwt', jwt, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        })

        setCookie(null, 'userId', userId, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        })

        setCookie(null, 'onboardingId', onboardingId, {
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        })

        setLoginError(false)
        setLoginErrorMessage('')

        return { user: res.data.user, jwt: res.data.jwt }
      })
      .catch((error) => {
        setProcessing(false)
        route.push('/')
        setLoginError(true)
        setLoginErrorMessage(error.response.data.message[0].messages[0].message)
        console.log(error.response.data.message[0].messages[0].message)
      })

    if (loginError) {
      return
    }

    if (loginData && loginData.jwt) {
      const jwtToken = await loginData.jwt
      const userData = await loginData.user
      const config = {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      }
      let loginNum = (await parseInt(userData.loginCount)) + 1
      const newUserData = { ...userData, loginCount: parseInt(loginNum) }

      const updateUser = await axios
        .put(`${UPDATE_URL}/users/${userData.id}`, { loginCount: loginNum }, config)
        .then((res) => {
          route.push('/dashboard')
          return res.data
        })
        .catch((err) => {
          console.log(err)
        })

      return jwtToken
    }
  }

  const handlePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <section className={styles.ax_login}>
      <div className={styles.ax_login_left_column}>
        <div className={styles.login_bg_icon}></div>
        <div className={styles.login_bg_1}></div>
        <div className={styles.login_bg_2}></div>
        <div className={styles.topbar}>
          {/* <img
            src="./images/bg-login-graphic-icon.png"
            alt="Indi Logo"
            style={{ width: '160px', maxWidth: '160px', height: 'auto', marginTop: '40px' }}
          /> */}
        </div>
        <div className={styles.footer}>
          <h2>WELCOME :)</h2>

          <h2>Your digital onboarding experience starts now...</h2>
          <h4>#TheIndiAdvantage</h4>
        </div>
      </div>
      <div className={styles.ax_login_right_column}>
        <img
          src="./images/indi-onboarding-logo.svg"
          alt="Indi Logo"
          style={{ width: '160px', maxWidth: '160px', height: 'auto', marginBottom: '40px' }}
        />
        <form className={`${styles.ax_login_form} ${styles.ax_form}`}>
          <div className={styles.ax_field}>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" placeholder="Email" onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className={styles.ax_field}>
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.btnShowPassword} type="button" onClick={handlePassword}>
              {showPassword ? <UilEye size={16} /> : <UilEyeSlash size={16} />}
            </button>
          </div>
          {loginError ? (
            <div className={styles.formError}>
              <p>
                <UilExclamationTriangle size={16} />
                {loginErrorMessage}
              </p>
            </div>
          ) : (
            ''
          )}

          <button type="submit" onClick={(e) => handleLogin(e)}>
            {processing ? <img src="/images/spinner-white.svg" alt="spinner" /> : ''}Login
          </button>
        </form>
        <div className={styles.formFooter}>
          <Link href="/forgot-password">Forgot Your Password? Click here.</Link>
        </div>
      </div>
    </section>
  )
}

export default Login
