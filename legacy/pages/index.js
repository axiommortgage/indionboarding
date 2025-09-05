import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import style from '../styles/Login.module.scss'
// import styles from '../styles/404.module.scss'
// import logo1 from '../public/images/indi-onboarding-logo.png'
// import logo2 from '../public/images/maintenance.png'
// import Image from 'next/image'

import Login from '../components/Login'
import AuthContext from '../context/authContext'

const Home = () => {
  const { userAuth } = useContext(AuthContext)
  const router = useRouter()
  const [content, setContent] = useState('')

  const showContent = () => {
    if (content === 'redirect') {
      router.push('/dashboard')
      return <h4 className={style.ax_page_subtitle}>Redirecting...</h4>
    }

    if (content === 'login') {
      return (
        <main>
          <Login />
        </main>
      )
    }
  }

  useEffect(() => {
    if (userAuth && userAuth.isAuth) {
      setContent('redirect')
    } else {
      setContent('login')
    }
  }, [userAuth])

  return (
    <div>
      {showContent()}

      {/* <div
        className={styles.notFound}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Image
          src={logo1.src}
          alt="Indi Central Logo"
          width={140}
          height={116}
          style={{ width: '140px', height: 'auto' }}
        />
        <div className={styles.illustration}>
          <Image
            src={logo2.src}
            alt="Under Maintenance"
            width={280}
            height={172}
            style={{ width: '280px', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>
        <h1 style={{ marginBottom: '0' }}>Under Maintenance</h1>
        <h3 style={{ fontWeight: '400' }}>
          We are performing a routine scheduled update. Please check back after <strong>July 01, 6:00PM (MST).</strong>{' '}
        </h3>
      </div> */}
    </div>
  )
}

export default Home
