import { useContext, useState, useEffect, useRef, memo } from 'react'
import Link from 'next/link'
import { UilAsterisk, UilCheckCircle, UilSignOutAlt } from '@iconscout/react-unicons'
import axios from 'axios'
import Cookies from 'js-cookie'
import AuthContext from '../context/authContext'
import { logout } from '../auth/auth'
import styles from '../styles/Menu.module.scss'

const MenuMob = (props) => {
  const { isMenuOpen } = props
  const { user, onboarding } = props
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const [menuHeight] = useState(0)
  const navMenu = useRef()
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`
  const token = Cookies.get('jwt')
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const { userInfo, forms } = userAuth

  const showFormStatus = (form) => {
    if (forms && forms[form] && forms[form].isFormComplete) {
      return (
        <>
          <UilCheckCircle size={16} fill="green" />
        </>
      )
    } else {
      return (
        <>
          <UilAsterisk size={16} fill="red" />
        </>
      )
    }
  }

  const handleLogout = () => {
    setUserAuth({ ...userAuth, isAuth: false })
    setTimeout(() => {
      logout()
    }, 500)
  }

  return (
    <aside className={`${styles.ax_menu_mob} ${isMenuOpen ? styles.axMenuOpened : ''}`}>
      <nav ref={navMenu} style={{ height: `${menuHeight}px` }}>
        <div className={styles.ax_menu_item}>
          <h3>Forms</h3>
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/broker-information"> Broker Information</Link>
          {showFormStatus('brokerInfo')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/photos"> Photos</Link>
          {showFormStatus('photos')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/business-card"> Business Card</Link>
          {showFormStatus('businessCardInfo')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/website-information"> Website Information</Link>
          {showFormStatus('websiteInfo')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/mpc-application"> MPC Application</Link>
          {showFormStatus('mpcApplication')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/letter-of-direction"> Letter Of Direction</Link>
          {showFormStatus('letterOfDirection')}
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/webforms/payment-authorization"> Payroll Information</Link>
          {showFormStatus('paymentAuthorization')}
        </div>

        <div className={styles.ax_menu_item}>
          <Link href="/webforms/contract"> Contract & Schedule</Link>
          {showFormStatus('contractAndSchedule')}
        </div>
        <div className={styles.ax_menu_item} style={{ marginBottom: '14px' }}>
          <Link href="/webforms/policies"> Policies and Procedures</Link>
          {showFormStatus('policiesAndProcedure')}
        </div>
        <div className={styles.sepparator}></div>
        <div className={styles.ax_menu_item}>
          {' '}
          <h3>Menu</h3>
        </div>
        <div className={styles.ax_menu_item}>
          <Link href="/dashboard"> Dashboard</Link>
        </div>

        <div className={styles.ax_menu_item}>
          <Link href="/support-team"> Your Support Team</Link>
        </div>
        <div className={styles.ax_menu_item}>
          <a onClick={handleLogout}>Logout</a>
        </div>
      </nav>
    </aside>
  )
}

export default memo(MenuMob)
