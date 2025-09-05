import {useState, useContext} from 'react'
import { Col, Row } from 'react-grid-system'
import FormsContext from '../context/formsContext'
import AuthContext from '../context/authContext'
import tableStyle from '../styles/Tables.module.scss'
import styles from '../styles/Sidebar.module.scss'

const Sidebar = (props) => {
  const {userAuth, setUserAuth} = useContext(FormsContext)
  const {forms, setForms} = useContext(FormsContext)
  const {fieldsValidation} = forms

  const showCommonForms = () => {
    if (userAuth && userAuth.userInfo){
      if(userAuth.userInfo.onboarding.length > 0) {
        return forms.map((f) => (
          <tr key={f.title}>
            <td>
              {' '}
              <Link href={`/forms/${f.slug}`}>{f.title}</Link>
            </td>
            <td>
              <UilCircle size={24} />
            </td>
          </tr>
        ))
      }
    }

    return ''
  }

  const showCustomForms = () => {
    if (userAuth && userAuth.userInfo){
      if(userAuth.userInfo.onboarding.length > 0) {
        return userAuth.userInfo && userAuth.userInfo.onboarding.map((f) => {
          if (f.isCustom) {
            return (
              <tr key={f.name}>
                <td>
                  {' '}
                  <Link href={`/forms/${f.formFile.hash}?custom=true`}>{f.formName}</Link>
                </td>
                <td>
                  <UilCheckCircle size={24} />
                </td>
              </tr>
            )
          }
        })
      } 
    }

    return ''
  }

  const formsTable = (isDisabled) => (
    <>
      {isDisabled ? (
        <Row align="center">
          <Col sm={1}>
            <p className={tableStyle.warning}>
              <UilExclamationTriangle size={24} />
            </p>
          </Col>
          <Col sm={11}>
            <p className={tableStyle.warning}>
              {' '}
              Please fill the all required fields on the <strong>Broker Information Form </strong> on Step 1 before
              signing the forms on Step 2.
            </p>
          </Col>
        </Row>
      ) : (
        ''
      )}
      <table className={`${tableStyle.table} ${tableStyle.checklistTable} ${tableStyle.formsTable}`}>
        <tbody>
          <tr>
            <th>Form</th>
            <th>Status</th>
          </tr>
          {showCommonForms()}
          {showCustomForms()}
        </tbody>
      </table>
    </>
  )


  return(
    <Col sm={12} md={4}>
      <div className={styles.sidebar}>
        <div className={tableStyle.formsList}>{fieldsValidation.length > 0 ? formsTable(true) : formsTable(false)}</div>
      </div>
    </Col>
  )
}

export default Sidebar
