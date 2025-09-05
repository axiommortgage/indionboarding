import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/authContext'
import { UilMultiply } from '@iconscout/react-unicons'
import style from '../styles/ToastsAlerts.module.scss'

const SaveAlert = (props) => {
  const { visible } = props
  const { userAuth, setUserAuth } = useContext(AuthContext)

  const handleClose = (e) => {
    setUserAuth({ ...userAuth, showAlert: false })
  }

  const saveForm = (e) => {
    e.preventDefault()
    setUserAuth({ ...userAuth, beforeLeave: { ...userAuth.beforeLeave, showAlert: false, action: 'save', event: e } })
  }

  const leavePage = (e) => {
    e.preventDefault()
    setUserAuth({ ...userAuth, beforeLeave: { ...userAuth.beforeLeave, showAlert: false, action: 'leave' } })
  }

  if (visible) {
    return (
      <>
        <div className={style.overlay}>
          <div className={style.alertBox}>
            <h3>You have unsaved information</h3>
            {/* <button onClick={(e) => handleClose(e)}>
              <UilMultiply color="red" size={16} />
            </button> */}
            <section className={style.content}>
              <p>What would you like to do?</p>
            </section>
            <footer>
              <button onClick={(e) => saveForm(e)}>Save it now</button>
              <button onClick={(e) => leavePage(e)}>Leave without saving</button>
            </footer>
          </div>
        </div>
      </>
    )
  }

  return ''
}

export default SaveAlert
