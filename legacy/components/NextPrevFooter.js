import { useRouter } from 'next/router'
import { useState, useContext, useEffect } from 'react'
import { UilArrowLeft, UilArrowRight } from '@iconscout/react-unicons'
import { Row, Col } from 'react-grid-system'
import { handleNextPrev } from '../helpers/nextPrevFormsNav'
import Button from './Button'
import AuthContext from '../context/authContext'
import style from '../styles/ToastsAlerts.module.scss'

const NextPrevFooter = () => {
  const { userAuth } = useContext(AuthContext)
  const [currentForm, setCurrentForm] = useState()
  const [menuOrderItems, setMenuOrderItems] = useState(null)
  const [nextPrev, setNextPrev] = useState()
  const route = useRouter()

  useEffect(() => {
    setMenuOrderItems(userAuth.menuOrder)
  }, [userAuth.menuOrder])

  useEffect(() => {
    if (currentForm && currentForm !== null && menuOrderItems && menuOrderItems !== null) {
      if (route.asPath === `/webforms/${currentForm}`) {
        setNextPrev(handleNextPrev(currentForm, menuOrderItems, userAuth.userInfo))
      }
    }
  }, [menuOrderItems])

  useEffect(() => {
    setCurrentForm(userAuth.lastFormVisited)
  }, [userAuth.lastFormVisited])

  return (
    <Row justify="between" style={{ marginTop: '54px' }}>
      {route.asPath === `/webforms/broker-information` ? (
        <Col sm={6}></Col>
      ) : (
        <Col sm={6}>
          <Button
            id="goToPrevtForm"
            name="goToPrevtForm"
            isLink
            linkPath={`/webforms/${nextPrev && nextPrev.prev ? nextPrev.prev : 'broker-information'}`}
            color="highlight"
            label="Prev Form"
            align="left"
            icon={<UilArrowLeft size={16} />}
            iconPos="left"
          />
        </Col>
      )}

      <Col sm={6}>
        <Button
          id="goToNextForm"
          name="goToNextForm"
          isLink
          linkPath={`/webforms/${nextPrev && nextPrev.next ? nextPrev.next : 'broker-information'}`}
          color="highlight"
          label="Next Form"
          align="right"
          icon={<UilArrowRight size={16} />}
          iconPos="right"
        />
      </Col>
    </Row>
  )
}

export default NextPrevFooter
