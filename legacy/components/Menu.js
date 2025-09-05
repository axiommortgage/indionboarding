import { useContext, useState, useRef, useEffect, memo } from 'react'
import { useRouter } from 'next/router'
import { UilTimesCircle, UilCheckCircle } from '@iconscout/react-unicons'
import AuthContext from '../context/authContext'
import { logout } from '../auth/auth'
import styles from '../styles/Menu.module.scss'

const Menu = (props) => {
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const [menuOrder, setMenuOrder] = useState()
  const [menuHeight] = useState(0)
  const navMenu = useRef()
  const { forms } = userAuth
  const router = useRouter()
  const user = userAuth.userInfo

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
          <UilTimesCircle size={16} fill="red" />
        </>
      )
    }
  }

  const showMenuItem = () => {
    let menuItems = []
    let order = []

    const forms = [
      'brokerInfo',
      'unlicensedInfo',
      'mpcApplication',
      'businessCardInfo',
      'websiteInfo',
      'letterOfDirection',
      'paymentAuthorization',
      'policiesAndProcedure',
      'unlicensedPolicies',
      'contractAndSchedule',
      'photos'
    ]

    const formName = (f) => {
      let form = f
      switch (form) {
        case 'brokerInfo':
          return { slug: 'broker-information', title: 'Broker Information', order: '1' }
        case 'unlicensedInfo':
          return { slug: 'unlicensed-information', title: 'Information', order: '1' }
        case 'photos':
          return { slug: 'photos', title: 'Photos', order: '2' }
        case 'businessCardInfo':
          return { slug: 'business-card', title: 'Business Card', order: '3' }
        case 'websiteInfo':
          return { slug: 'website-information', title: 'Website Information', order: '4' }
        case 'mpcApplication':
          return { slug: 'mpc-application', title: 'MPC Application', order: '5' }
        case 'letterOfDirection':
          return { slug: 'letter-of-direction', title: 'Letter Of Direction', order: '6' }
        case 'paymentAuthorization':
          return { slug: 'payment-authorization', title: 'Payroll Information', order: '7' }
        case 'contractAndSchedule':
          return { slug: 'contract', title: 'Contract And Schedule', order: '8' }
        case 'policiesAndProcedure':
          return { slug: 'policies', title: 'Policies And Procedure', order: '9' }
        case 'unlicensedPolicies':
          return { slug: 'unlicensed-policies', title: 'Unlicensed Policies', order: '10' }
        default:
          return user && user.licensed === false
            ? { slug: 'unlicensed-information', title: 'Information', order: '1' }
            : { slug: 'broker-information', title: 'Broker Information', order: '1' }
      }
    }

    const allForms = userAuth.forms

    for (let item in allForms) {
      forms.forEach((frm) => {
        if (frm === item && allForms[item] !== null) {
          menuItems.push(
            <div className={styles.ax_menu_item} style={{ color: 'red', order: formName(item).order }} key={item.order}>
              <a href={`/webforms/${formName(item).slug}`} onClick={(e) => handleLink(e)}>
                {' '}
                {formName(item).title}
              </a>
              {showFormStatus(item)}
            </div>
          )

          order.push({ order: formName(item).order, title: formName(item).title, slug: formName(item).slug })
        }
      })
    }
    return { menuItems, order }
  }

  const handleLogout = () => {
    setUserAuth({ ...userAuth, isAuth: false })
    setTimeout(() => {
      logout()
    }, 500)
  }

  const handleLink = (e) => {
    e.preventDefault()
    if (userAuth && userAuth.forms && userAuth.forms.isFormSaved === false) {
      setUserAuth({ ...userAuth, beforeLeave: { showAlert: true, action: null, route: e.target.href } })
      return
    } else {
      setUserAuth({
        ...userAuth,
        beforeLeave: { showAlert: false, action: null, route: null },
        forms: { ...userAuth.forms, isFormSaved: true }
      })
      router.push(e.target.href)
    }
  }

  useEffect(() => {
    if (showMenuItem() && showMenuItem().order && showMenuItem().order.length > 0) {
      setMenuOrder(showMenuItem().order)
    }
  }, [])

  useEffect(() => {
    setUserAuth({ ...userAuth, menuOrder })
  }, [menuOrder])

  return (
    <aside className={`${styles.ax_menu}`}>
      <div className={styles.scrollContainer}>
        <nav ref={navMenu} style={{ height: `${menuHeight}px` }}>
          <section className={styles.menu}>{showMenuItem().menuItems}</section>

          <section className={styles.menu}>
            <div className={styles.sepparator} style={{ marginBottom: '16px' }}></div>
            <div className={styles.ax_menu_item}>
              {' '}
              <h3>Menu</h3>
            </div>
            <div className={styles.ax_menu_item}>
              <a href="/dashboard" onClick={(e) => handleLink(e)}>
                {' '}
                Dashboard
              </a>
            </div>
            <div className={styles.ax_menu_item}>
              <a href="/support-team" onClick={(e) => handleLink(e)}>
                {' '}
                Your Support Team
              </a>
            </div>
            <div className={styles.ax_menu_item}>
              <a onClick={handleLogout}>Logout</a>
            </div>
          </section>
        </nav>
      </div>
    </aside>
  )
}
export default Menu

// export default memo(Menu)
