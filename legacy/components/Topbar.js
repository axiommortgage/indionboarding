import Router from 'next/router'
import NProgress from 'nprogress'
import { useState, useContext, useEffect, memo } from 'react'
import { UilArrowLeft, UilArrowRight } from '@iconscout/react-unicons'
import { updatePercentage } from '../helpers/savingForms'
import { handleNextPrev } from '../helpers/nextPrevFormsNav'
import Button from './Button'
import AuthContext from '../context/authContext'
import Avatar from './Avatar'
import PercentBar from './PercentBar'
import MenuMob from './MenuMob'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import styles from '../styles/Topbar.module.scss'

export const customLoader = () => `
      <div class="${styles.ax_loading_bar} bar" role="bar">
        <div class="${styles.ax_loading_peg} peg">
        </div>
      </div>
      <div class="${styles.ax_loading_spinner} spinner" role="spinner">
        <div class="${styles.ax_loading_spinner_icon} spinner-icon">
        </div>
      </div>
   `

NProgress.configure({
  template: customLoader()
})

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const Topbar = (props) => {
  const { route } = props
  const { userAuth } = useContext(AuthContext)
  const [menuMobIsOpen, setMenuMobIsOpen] = useState(false)
  const [currentForm, setCurrentForm] = useState()
  const [percentage, setPercentage] = useState(0)
  const [menuOrderItems, setMenuOrderItems] = useState(null)
  const [nextPrev, setNextPrev] = useState()

  useEffect(() => {
    if (userAuth && userAuth.forms) {
      const { forms } = userAuth
      const pct = updatePercentage(forms)
      setPercentage(pct)
    } else {
      setPercentage(0)
    }
  }, [userAuth])

  useEffect(() => {
    setMenuOrderItems(userAuth.menuOrder)
  }, [userAuth.menuOrder])

  useEffect(() => {
    if (currentForm && currentForm !== null && menuOrderItems && menuOrderItems !== null) {
      if (route && route.asPath === `/webforms/${currentForm}`) {
        setNextPrev(handleNextPrev(currentForm, menuOrderItems))
      }
    }
  }, [menuOrderItems])

  useEffect(() => {
    setCurrentForm(userAuth.lastFormVisited)
  }, [userAuth.lastFormVisited])

  const handleOpenMenuMob = () => {
    setMenuMobIsOpen(!menuMobIsOpen)
  }

  return (
    <>
      <header className={styles.ax_topbar}>
        <div className={styles.ax_logo}>
          <img src="/images/indi-mortgage-logo.svg" alt="indi mortgage logo" />
        </div>
        {percentage === 100 || percentage === '100' ? (
          <div>
            {Router.asPath === '/support-team' || Router.asPath === '/dashboard' || Router.asPath === '/finished' ? (
              <Button
                color="highlight"
                align="right"
                id="goToForms"
                sizing="xsmall"
                action={
                  userAuth && userAuth.userInfo && userAuth.userInfo.licensed === false
                    ? (e) => Router.push('/webforms/unlicensed-information')
                    : (e) => Router.push('/webforms/broker-information')
                }
                label="Go To Forms"
              />
            ) : (
              ''
            )}
          </div>
        ) : (
          <>
            <div className={styles.percent}>
              <PercentBar value={percentage} />
            </div>
            <div style={{ margin: '0 auto 0 16px' }}>
              {Router.asPath === '/support-team' || Router.asPath === '/dashboard' || Router.asPath === '/finished' ? (
                <Button
                  color="highlight"
                  align="right"
                  id="goToForms"
                  sizing="xsmall"
                  action={
                    userAuth && userAuth.userInfo && userAuth.userInfo.licensed === false
                      ? (e) => Router.push('/webforms/unlicensed-information')
                      : (e) => Router.push('/webforms/broker-information')
                  }
                  label="Go To Forms"
                />
              ) : (
                ''
              )}
            </div>
          </>
        )}

        {Router.asPath !== '/dashboard' && Router.asPath !== '/support-team' && Router.asPath !== '/finished' ? (
          userAuth && userAuth.forms && userAuth.forms.isFormSaved ? (
            <div className={styles.nextPrev}>
              {route.asPath === `/webforms/broker-information` ? (
                ''
              ) : (
                <Button
                  id="goToPrevtForm"
                  name="goToPrevtForm"
                  isLink
                  linkPath={`/webforms/${nextPrev && nextPrev.prev ? nextPrev.prev : 'broker-information'}`}
                  color="highlight"
                  label="Prev Form"
                  align="center"
                  sizing="xsmall"
                  icon={<UilArrowLeft size={16} />}
                  iconPos="left"
                />
              )}
              <Button
                id="goToNextForm"
                name="goToNextForm"
                isLink
                linkPath={`/webforms/${nextPrev && nextPrev.next ? nextPrev.next : 'broker-information'}`}
                color="highlight"
                label="Next Form"
                align="center"
                sizing="xsmall"
                icon={<UilArrowRight size={16} />}
                iconPos="right"
              />
            </div>
          ) : (
            ''
          )
        ) : (
          ''
        )}

        <div className={styles.ax_topbar_actions}>
          {userAuth.userInfo ? (
            <>
              <h3>
                {userAuth.userInfo.firstname} {userAuth.userInfo.lastname}
              </h3>
              <Avatar photoUrl={userAuth.userInfo.photo ? userAuth.userInfo.photo.url : ''} size={40} menu />
            </>
          ) : (
            ''
          )}
          <button
            className={`${styles.btnMenuMob} ${menuMobIsOpen ? styles.btnMenuMobOpen : ''}`}
            onClick={handleOpenMenuMob}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <MenuMob isMenuOpen={menuMobIsOpen} />
    </>
  )
}
export default Topbar

//export default memo(Topbar)
