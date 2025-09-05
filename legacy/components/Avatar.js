import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { logout } from '../auth/auth'
import AuthContext from '../context/authContext'
import styles from '../styles/Avatar.module.scss'

const Avatar = (props) => {
  const { photoUrl, size, menu } = props
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const { forms } = userAuth
  const [menuOrder, setMenuOrder] = useState()

  const handleLogout = () => {
    setUserAuth({ ...userAuth, isAuth: false })
    setTimeout(() => {
      logout()
    }, 500)
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
            <li style={{ order: formName(item).order }}>
              <Link key={item.order} href={`/webforms/${formName(item).slug}`} passHref legacyBehavior>
                <a>{formName(item).title}</a>
              </Link>
            </li>
          )

          order.push({ order: formName(item).order, title: formName(item).title, slug: formName(item).slug })
        }
      })
    }
    return { menuItems, order }
  }

  useEffect(() => {
    if (showMenuItem() && showMenuItem().order && showMenuItem().order.length > 0) {
      setMenuOrder(showMenuItem().order)
    }
  }, [])

  useEffect(() => {
    setUserAuth({ ...userAuth, menuOrder })
  }, [menuOrder])

  if (menu) {
    return (
      <div className={styles.avatarMenu}>
        <Link href="#" passHref legacyBehavior>
          <a
            href="#"
            className={styles.ax_avatar}
            style={{
              backgroundImage: `url(${photoUrl})`,
              width: `${size ? `${size}px` : '60px'}`,
              height: `${size ? `${size}px` : '60px'}`
            }}
          >
            .
          </a>
        </Link>
        <ul>
          {showMenuItem().menuItems}
          <div className={styles.sepparator} style={{ margin: '8px 0', order: '14' }}></div>

          <li style={{ order: '15' }}>
            <Link href="/dashboard" passHref legacyBehavior>
              <a>Dashboard</a>
            </Link>
          </li>
          <li style={{ order: '15' }}>
            <Link href="/support-team" passHref legacyBehavior>
              <a>Support Team</a>
            </Link>
          </li>
          <li style={{ order: '15' }}>
            <a onClick={handleLogout}>Logout</a>
          </li>
        </ul>
      </div>
    )
  } else {
    return (
      <Link href="#" passHref legacyBehavior>
        <a
          href="#"
          className={styles.ax_avatar}
          style={{
            backgroundImage: `url(${photoUrl})`,
            width: `${size ? `${size}px` : '60px'}`,
            height: `${size ? `${size}px` : '60px'}`
          }}
        >
          .
        </a>
      </Link>
    )
  }
}

export default Avatar
