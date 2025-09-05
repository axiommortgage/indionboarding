import { useState, useEffect } from 'react'
import style from '../styles/AddressSelect.module.scss'

const AddressSelect = (props) => {
  const { branches, action } = props
  // const [cities, setCities] = useState({})
  const [val, setVal] = useState('select')

  const handleAction = (e) => {
    setVal(e.target.value)
  }

  const handleOptions = () => {
    if (branches === null || !branches || branches === '' || branches === undefined) {
      return <option value="">Loading...</option>
    } else {
      let i = 0
      return (
        <>
          <option value="select">Select</option>
          {branches && branches.length > 0
            ? branches.map((opt) => {
                i++
                const result = opt.city.replace(/([A-Z])/g, '$1')
                const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
                const selectItem = `${finalResult} - License: ${
                  opt.provinceLicenseNumber && opt.provinceLicenseNumber.length > 0
                    ? `#${opt.provinceLicenseNumber}`
                    : 'NA'
                }`
                return (
                  <option key={`${opt}-${i}`} value={finalResult}>
                    {selectItem}
                  </option>
                )
              })
            : 'loading...'}
        </>
      )
    }
  }

  const handleSelectedAddress = (val, brch) => {
    const selected = brch.filter((a) => {
      return val.toLowerCase() === a.city.toLowerCase()
    })
    const { address, city, province, postal } = selected[0]
    return { address, city, province, postalCode: postal }
  }

  //Effects
  useEffect(() => {
    if (val && val !== 'select') {
      action(handleSelectedAddress(val, branches))
    }
  }, [val])

  return (
    <div className={style.ax_field}>
      <label htmlFor="address">Select an Indi Branch</label>
      <select onChange={(e) => handleAction(e)} value={val}>
        {handleOptions()}
      </select>
    </div>
  )
}

export default AddressSelect
