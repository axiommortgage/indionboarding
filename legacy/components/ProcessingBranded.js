import styles from '../styles/Loaders.module.scss'

const ProcessingBranded = (props) => {
  const { processing, message, size } = props
  

  if (processing === true) {
    return (
      <div  className={styles.ax_processing_branded} style={size !== null && size !== '' ? {width: `${size}px`, height:`${size}px`} : ''}>
        <span />
        <p>{message}</p>
      </div>
    )
  }
  return <div className={styles.ax_processing_hidden} />
}

export default ProcessingBranded
