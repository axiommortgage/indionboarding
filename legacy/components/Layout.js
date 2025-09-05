import { useEffect, useContext, useState, memo } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Cookies from 'js-cookie'
import AuthContext from '../context/authContext'
import ProcessingBranded from './ProcessingBranded'
import Topbar from './Topbar'
import Toast from './Toast'
import SaveAlert from './SaveAlert'
import Menu from './Menu'
import Main from './Main'
import Complete from './Complete'
import styles from '../styles/Layout.module.scss'

const Layout = (props) => {
  const { fullpage, toast } = props
  const { userAuth, setUserAuth } = useContext(AuthContext)
  const { children, containered } = props
  const [percentage, setPercentage] = useState(0)
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`
  const token = Cookies.get('jwt')
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const userId = Cookies.get('userId')
  const onboardingId = Cookies.get('onboardingId')
  const router = useRouter()

  const fetchData = async () => {
    const data = await axios
      .get(`${API_URL}/users?id=${userId}`, config)
      .then((res) => {
        const me = res.data[0]
        return me
      })
      .then(async (user) => {
        const onboardingForms = await axios
          .get(`${API_URL}/onboarding-processes/${onboardingId}`, config)
          .then((res) => {
            const obdForms = res.data
            setUserAuth({ ...userAuth, userInfo: user, forms: { ...obdForms, isFormSaved: true } })
          })
          .catch((err) => {
            throw err
          })
      })
      .catch((err) => {
        throw err
      })
    return data
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        if (userAuth && userAuth.forms && !userAuth.forms.isFormSaved) {
          setUserAuth({ ...userAuth, beforeLeave: { showAlert: true, action: null, route: router.asPath } })
          return false
        }
      }
      setUserAuth({
        ...userAuth,
        beforeLeave: { showAlert: false, action: null, route: null },
        forms: { ...userAuth.forms, isFormSaved: true }
      })

      return true
    })

    return () => {
      router.beforePopState(() => true)
    }
  }, [router])

  useEffect(() => {
    if (userAuth && userAuth.forms) {
      const pct = parseInt(userAuth.forms.completionPercent)
      if (pct && pct > 0 && pct === 100) {
        setPercentage(pct)
      } else if (pct !== 100 && pct > 0) {
        setPercentage(pct)
      } else {
        setPercentage(0)
      }
    }
  }, [userAuth.forms])

  const showLayout = () => {
    return (
      <>
        <SaveAlert
          visible={
            userAuth && userAuth.beforeLeave && userAuth.beforeLeave.showAlert ? userAuth.beforeLeave.showAlert : false
          }
        />
        {fullpage ? (
          <section className={styles.ax_fullpageLayout}>
            <Topbar className={styles.ax_topbar} />
            <Main className={styles.ax_main} fullpage>
              <>
                {toast.status === 'success' ? (
                  <Toast toastType={toast.status} showToast={true} message={toast.message} />
                ) : toast.status === 'error' ? (
                  <Toast toastType={toast.status} showToast={true} message={toast.message} />
                ) : (
                  ''
                )}

                {percentage === 100 && router.asPath !== '/support-team' && router.asPath !== '/finished' ? (
                  <Complete />
                ) : (
                  ''
                )}

                {percentage !== 100 && router.asPath === '/dashboard' ? children : ''}

                {percentage === 100 && router.asPath === '/finished' ? children : ''}

                {router.asPath === '/support-team' ? children : ''}
              </>
            </Main>
          </section>
        ) : (
          <section className={styles.ax_layout}>
            <Topbar className={styles.ax_topbar} route={router} />
            <Menu className={styles.ax_menu} user={userAuth.userInfo} onboarding={userAuth.forms} />
            <Main className={styles.ax_main}>
              <>
                {toast.status === 'success' ? (
                  <Toast toastType={toast.status} showToast={true} message={toast.message} />
                ) : toast.status === 'error' ? (
                  <Toast toastType={toast.status} showToast={true} message={toast.message} />
                ) : (
                  ''
                )}

                {percentage && percentage === 100 && router.asPath !== '/support-team' ? <Complete /> : ''}

                {(percentage && percentage !== 100 && router.asPath === '/dashboard') ||
                router.asPath === '/support-team'
                  ? children
                  : ''}

                {children}
              </>
            </Main>
          </section>
        )}
      </>
    )
  }

  if (userAuth && userAuth.userInfo) {
    return showLayout()
  } else {
    return <ProcessingBranded processing message="Loading ..." />
  }
}

export default Layout

// export default memo(Layout)
