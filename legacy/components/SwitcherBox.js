import { useRef, useEffect } from 'react'
import style from '../styles/Switcher.module.scss'

const SwitcherBox = (props) => {
  const { state, id, name, checked, disabled, action, label, labelPos, defaultValue, value, yesno, description } = props
  const isChecked = useRef()

  const handleChecked = () => {
    if (checked) {
      isChecked.current.setAttribute('checked', true)
    } else {
      isChecked.current.removeAttribute('checked')
    }
  }

  const handleLabelPosition = () => {
    switch (labelPos) {
      case 'top':
        return style.labelTop
      case 'left':
        return style.labelLeft
      default:
        return style.labelLeft
    }
  }

  useEffect(() => {
    handleChecked()
  }, [checked])

  return (
    <div className={`${style.switcherBox} ${handleLabelPosition()} ${yesno ? style.yeNoSwitcherBox : ''} `}>
      {label && labelPos && labelPos === 'top' ? <label htmlFor={name}>{label}</label> : ''}
      <div className={style.switcherContainer}>
        <div className={style.leftBox}>
          <span>Yes</span>
        </div>
        <div className={style.rightBox}>
          <span>No</span>
        </div>

        {disabled ? (
          <input
            id={id}
            ref={isChecked}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(e) => action(e)}
            defaultValue={defaultValue}
            value={value}
            disabled
          />
        ) : (
          <input
            id={id}
            ref={isChecked}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(e) => action(e)}
            defaultValue={defaultValue}
            value={value}
          />
        )}
      </div>
      {label && labelPos && labelPos !== 'top' ? <label htmlFor={name}>{label}</label> : ''}
      {description ? <p>{description}</p> : ''}
    </div>
  )
}

export default SwitcherBox
