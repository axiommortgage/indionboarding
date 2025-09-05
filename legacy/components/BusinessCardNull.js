import style from '../styles/BusinessCard.module.scss'

const BusinessCardNull = (props) => {
  return (
    <div className={`${style.frontNull}`}>
      <h3>{props.data}</h3>
    </div>
  )
}

export default BusinessCardNull
