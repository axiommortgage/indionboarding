import { useState, useEffect } from 'react'
import { Row, Col } from 'react-grid-system'
import BusinessCardFront from './BusinessCardFront'
import BusinessCardBack from './BusinessCardBack'
import BusinessCardNull from './BusinessCardNull'

const BusinessCard = (props) => {
  const { cardData } = props
  const { cardFrontStyle, cardBackStyle } = cardData

  const [data, setData] = useState(cardData)

  useEffect(() => {
    setData(cardData)
  }, [cardData])

  return (
    <>
      <Row>
        <Col sm={12} md={12} lg={6}>
          {cardFrontStyle === null || !cardFrontStyle || cardFrontStyle === undefined ? (
            <BusinessCardNull data="Select a design below." />
          ) : (
            <BusinessCardFront data={data} />
          )}
        </Col>

        <Col sm={12} md={12} lg={6}>
          {cardBackStyle === null || !cardBackStyle || cardBackStyle === undefined ? (
            <BusinessCardNull data="Select a design below." />
          ) : (
            <BusinessCardBack data={data} />
          )}
        </Col>
      </Row>
    </>
  )
}

export default BusinessCard
