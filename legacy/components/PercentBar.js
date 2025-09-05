import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system'
import style from '../styles/PercentBar.module.scss'

const PercentBar = (props) => {
  const { value } = props
  const [barStatus, setBarStatus] = useState('loading')

  const innerBarCalc = () => {
    if (isNaN(value)) {
      setBarStatus('loading')
      return
    } else {
      setBarStatus(value)
      return value
    }
  }

  useEffect(() => {
    innerBarCalc()
  }, [])

  useEffect(() => {
    innerBarCalc()
  }, [value])

  return (
    <section className={style.percentBarContainer}>
      <div className={style.percentBarInnerContent}>
        <h3 className={style.percentBarHeading}>Onboarding Progress</h3>
        <div className={style.percentBar}>
          {barStatus === 'loading' ? (
            <div className={`${style.innerBar} ${style.innerBarLoading}`}>
              <span>Loading...</span>
            </div>
          ) : (
            <div className={style.innerBar} style={{ width: `${barStatus}%` }}>
              <span>{barStatus}%</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PercentBar
