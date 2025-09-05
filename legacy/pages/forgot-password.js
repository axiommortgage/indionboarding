import { useState } from 'react'
import axios from 'axios'
import style from '../styles/Password.module.scss'
import alerts from '../styles/ToastsAlerts.module.scss'

const NewPassword = () => {
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState('')
  const [spinner, setSpinner] = useState(false)

  const ApiUrl = process.env.NEXT_PUBLIC_API_URL

  const forgotPassword = async (e) => {
    e.preventDefault()
    setSpinner(true)

    await axios
      .post(`${ApiUrl}/auth/forgot-password`, {
        email: userEmail
      })
      .then((res) => {
        if (res.data.ok) {
          setMessage('success')
          setSpinner(false)
        }
      })
      .catch(() => {
        setMessage('error')
        setSpinner(false)
      })
  }

  const showMessage = () => {
    switch (message) {
      case 'success': {
        return (
          <div className={alerts.ax_tip}>
            <p>
              Success! <strong>Within 10 minutes</strong> you will receive an email with instructions to reset your
              password.
            </p>
          </div>
        )
      }
      case 'error': {
        return (
          <div className={alerts.ax_tip_error}>
            <p>Ooops! The informed email doesn&apos;t exist in our database. Please inform your registration email.</p>
          </div>
        )
      }

      default:
        return ''
    }
  }

  const response = showMessage()

  return (
    <section className={`${style.ax_section} ${style.ax_form_container}`}>
      <img
        src="./images/indi-onboarding-logo.svg"
        alt="Indi Logo"
        style={{ width: '160px', maxWidth: '160px', height: 'auto', marginBottom: '40px' }}
      />
      <h1 className={style.ax_page_title}>Forgot Password</h1>
      <form className={style.ax_form}>
        <p>
          Please insert your registration email and click on Send button. You&apos;ll receive an email with instructions
          on how to reset your password.
        </p>
        <div className={style.ax_field}>
          <label htmlFor="email">Your Registration Email</label>
          <input type="email" name="email" placeholder="Email" onChange={(e) => setUserEmail(e.target.value.trim())} />
        </div>
        <div className={style.ax_field}>
          <button className={style.ax_btn_submit} name="forgot" type="submit" onClick={(e) => forgotPassword(e)}>
            {spinner ? <img src="/images/spinner-white.svg" alt="spinner" /> : ''}Send
          </button>
        </div>

        <div className={style.ax_response}>{response}</div>
      </form>
    </section>
  )
}

export default NewPassword
