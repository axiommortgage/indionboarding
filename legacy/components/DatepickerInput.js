import { useState } from 'react'
import formstyle from '../styles/Forms.module.scss'

const DatepickerInput = ({ ...props }) => {
  const [dateVal, setDateVal] = useState(null)

  const handleInput = (e) => {
    setDateVal(e.target.value)
  }

  return (
    <div className={formstyle.ax_datepicker}>
      <span className={formstyle.datepickerToggle}>
        <span className={formstyle.datepickerToggleButton}></span>
        <input
          type="date"
          className={formstyle.datepickerInput}
          {...props}
          value={dateVal}
          onChange={(e) => handleInput(e)}
        />
      </span>
    </div>
  )
}

export default DatepickerInput
