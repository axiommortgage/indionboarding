import { checkPreviousData } from '../helpers/savingForms'
import style from '../styles/Forms.module.scss'

const RepeaterField = (props) => {
  const { options, changeAction, data, form } = props

  return (
    <div className={style.ax_field}>
      <label htmlFor="facebook">Facebook Page</label>
      <input
        type={options.type}
        name={options.name}
        id={options.id}
        placeholder={options.placeholder}
        defaultValue={
          data.user || data.onboarding ? checkPreviousData(form, options.name, data.user, data.onboarding) : ''
        }
        onChange={changeAction}
      />
    </div>
  )
}

export default RepeaterField
