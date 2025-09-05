import styles from '../styles/Profile.module.scss'

const FormSectionTitle = (props) => {
  const { title, subtitle, description, icon, color } = props

  return (
    <header className={styles.formSectionTitle}>
      <h3 style={color ? { color } : {}}>
        {icon || ''}
        {title}
      </h3>
      {subtitle ? <h4>{subtitle}</h4> : ''}
      {description ? <p>{description}</p> : ''}
      <div className={styles.sepparator} />
    </header>
  )
}

export default FormSectionTitle
