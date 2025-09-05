import { useState, useEffect } from 'react'
import { UilMultiply } from '@iconscout/react-unicons'
import styles from '../styles/ToastsAlerts.module.scss'

const Toast = (props) => {
  const { toastType, showToast, message } = props
  const [isOpen, setIsOpen] = useState(showToast)

  const handleClose = (e) => {
    e.preventDefault()
    setIsOpen(false)
  }

  useEffect(() => {
    if (showToast === true) {
      setIsOpen(true)
      setTimeout(() => {
        setIsOpen(false)
      }, 8000)
    }
  }, [showToast])

  return (
    <div
      className={`
        ${styles.ax_toast} 
        ${toastType && toastType === 'error' ? styles.ax_toast_error : ''} 
        ${toastType && toastType && toastType === 'success' ? styles.ax_toast_success : ''} 
        ${isOpen ? styles.ax_toast_visible : styles.ax_toast_hidden} 
      `}
    >
      <button type="button" onClick={(e) => handleClose(e)}></button>
      <h3>
        {toastType && toastType === 'success' ? 'Success!' : ''}
        {toastType && toastType === 'error' ? 'Error!' : ''}
      </h3>
      <p>{message}</p>
    </div>
  )
}

export default Toast
