import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { UilEyeSlash, UilEye } from '@iconscout/react-unicons'
import style from '../styles/Password.module.scss'
import ResetPasswordStatus from '../components/ResetPasswordStatus'

const NewPassword = () => {
  const router = useRouter()
  const { code } = router.query

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState('neutral')
  const [seeNew, setSeeNew] = useState(false)
  const [seeConfirm, setSeeConfirm] = useState(false)
  const [spinner, setSpinner] = useState(false)

  const ApiUrl = process.env.NEXT_PUBLIC_API_URL

  const passValidation = () => {
    if (
      newPassword.length > 0 &&
      newPassword.length > 5 &&
      confirmNewPassword.length > 0 &&
      confirmNewPassword.length > 5
    ) {
      if (newPassword === confirmNewPassword) {
        return true
      }
      setMessage('error')
      setSpinner(false)
      return false
    }
    setMessage('error')
    setSpinner(false)
  }

  const resetPassword = (e) => {
    e.preventDefault()
    setSpinner(true)
    const validation = passValidation()

    if (validation) {
      axios
        .post(`${ApiUrl}/auth/reset-password`, {
          code, // code contained in the reset link of step 3.
          password: newPassword,
          passwordConfirmation: confirmNewPassword
        })
        .then(() => {
          setMessage('success')
          setSpinner(false)
        })
        .catch(() => {
          setMessage('error')
          setSpinner(false)
        })
    }
  }

  const seePassword = (e, field) => {
    e.preventDefault()

    if (field === 'new') {
      setSeeNew(!seeNew)
    }
    if (field === 'confirm') {
      setSeeConfirm(!seeConfirm)
    }
  }

  return (
    <section className={`${style.ax_section} ${style.ax_form_container}`}>
      <img
        src="./images/indi-onboarding-logo.svg"
        alt="Indi Logo"
        style={{ width: '160px', maxWidth: '160px', height: 'auto', marginBottom: '40px' }}
      />
      <h1 className={style.ax_page_title}>Reset Password</h1>
      <form className={style.ax_form}>
        <p>Insert and confirm your new password. It must contain at least 6 characters.</p>
        <div className={style.ax_field}>
          <label htmlFor="password">New Password</label>
          {seeNew ? (
            <input type="text" name="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          ) : (
            <input
              type="password"
              name="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
          <button type="button" className={style.see} onClick={(e) => seePassword(e, 'new')}>
            {seeNew ? <UilEye /> : <UilEyeSlash />}
          </button>
        </div>
        <div className={style.ax_field}>
          <label htmlFor="passwordConfirmation">Confirm New Password</label>
          {seeConfirm ? (
            <input
              type="text"
              name="passwordConfirmation"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          ) : (
            <input
              type="password"
              name="passwordConfirmation"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          )}
          <button type="button" className={style.see} onClick={(e) => seePassword(e, 'confirm')}>
            {seeConfirm ? <UilEye /> : <UilEyeSlash />}
          </button>
        </div>
        <div className={style.ax_field}>
          <button className={style.ax_btn_submit} name="forgot" type="submit" onClick={(e) => resetPassword(e)}>
            {spinner ? <img src="/images/spinner-white.svg" alt="spinner" /> : ''}Send
          </button>
        </div>
        <ResetPasswordStatus status={message} />
      </form>
    </section>
  )
}

export default NewPassword
