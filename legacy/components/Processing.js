import {useRef, useEffect, useCallback} from 'react'
import styles from '../styles/Loaders.module.scss'

const Processing = (props) => {
  const { processing, message, size, positionRef, top } = props
  const position = useRef(null)

  useEffect(()=>{
    positionRef(position)
  },[])

  useCallback(()=>{
    conosle.log('top:', top)
  },[top])
  

  if (processing === true) {
    return (
      <div  ref={position} className={styles.ax_processing} style={size !== null && size !== '' ? {width: `${size}px`, height:`${size}px`} : ''}>
        <span />
        <p>{message}</p>
      </div>
    )
  }
  return <div className={styles.ax_processing_hidden} />
}

export default Processing
