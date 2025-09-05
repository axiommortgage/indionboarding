import Link from 'next/link'
import style from '../styles/Password.module.scss'
import alerts from '../styles/ToastsAlerts.module.scss'

const ResetPasswordStatus = (props) => {
  const { status } = props

  return (
    <div className={style.ax_response}>
      <div className={style.message}>
        {status === 'success' ? (
          <div className={alerts.ax_tip}>
            <p>
              Your password has been reset successfuly.{' '}
              <Link href="/" legacyBehavior>
                <a>Go to Login</a>
              </Link>
            </p>
          </div>
        ) : (
          ''
        )}
        {status === 'error' ? (
          <div className={alerts.ax_tip_error}>
            <p>Passwords doesn&apos;t match or has less than 5 characters.</p>
          </div>
        ) : (
          ''
        )}
        {status === 'neutral' ? '' : ''}
      </div>
    </div>
  )
}

export default ResetPasswordStatus
