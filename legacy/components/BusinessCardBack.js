import style from '../styles/BusinessCard.module.scss'

const BusinessCardBack = (props) => {
  const { data } = props

  if (data) {
    const { address, cardBackStyle } = data

    return (
      <div
        className={`${style.businessCardBack} ${cardBackStyle === 'back1' ? style.back1 : ''} ${
          cardBackStyle === 'back2' ? style.back2 : ''
        }`}
      >
        {address ? <p> {address} </p> : ''}
      </div>
    )
  }

  return ''
}

export default BusinessCardBack
