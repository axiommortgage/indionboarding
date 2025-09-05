import {useRef, useEffect} from 'react'
import style from '../styles/Switcher.module.scss'

const Switcher = props => {
  const {id, name, checked, disabled, action, label, labelPos, defaultValue, value, yesno} = props
  const isChecked = useRef()

  const handleChecked = () => {
    if(checked){
      isChecked.current.setAttribute('checked', true)
    }else{
      isChecked.current.removeAttribute('checked')
    }
  }  

  const handleLabelPosition = () => {
    switch(labelPos){
      case 'top': return style.labelTop
      case 'left': return style.labelLeft
      default: return style.labelLeft
    }
  }

  useEffect(()=>{
    handleChecked()
  },[checked])


  return (
    <div className={`${style.switcher} ${handleLabelPosition()} ${yesno ? style.yeNoSwitcher : ''}`}>
      {label ? <label htmlFor={name}>{label}</label> : ''}  
      {disabled ? 
        <input 
          id={id} 
          ref={isChecked} 
          name={name} 
          type="checkbox" 
          checked={checked} 
          onChange={e => action(e)}                        
          defaultValue={defaultValue}
          value={value}
          disabled
        />
      :       
      <input 
        id={id} 
        ref={isChecked} 
        name={name} 
        type="checkbox" 
        checked={checked} 
        onChange={e => action(e)}                        
        defaultValue={defaultValue}
        value={value}
    />
  }    
      
    </div>
  )
}

export default Switcher