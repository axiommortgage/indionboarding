/* eslint-disable react/jsx-props-no-spreading */
import Head from 'next/head'
import '../styles/globals.css'
import { useState } from 'react'
import AuthContext from '../context/authContext'
import ModalInfoContext from '../context/modalInfoContext'
import { authStatus } from '../auth/auth'
import styles from '../styles/404.module.scss'

const MyApp = ({ Component, pageProps }) => {
  const [userAuth, setUserAuth] = useState({
    isAuth: authStatus(),
    beforeLeave: { action: 'stay', route: null },
    forms: { isFormSaved: true }
  })

  const [modalInfo, setModalInfo] = useState({ showModal: false, content: null, userVCard: null })

  return (
    <>
      <Head>
        <title>Onboarding - Indi Mortgage</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <AuthContext.Provider value={{ userAuth, setUserAuth }}>
        <ModalInfoContext.Provider value={{ modalInfo, setModalInfo }}>
          <Component {...pageProps} key="components" />
        </ModalInfoContext.Provider>
      </AuthContext.Provider>
    </>
  )
}

export default MyApp
