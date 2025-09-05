import { useContext } from 'react'
import { useRouter } from 'next/router'
import AuthContext from '../context/authContext'
import Button from '../components/Button'
import styles from '../styles/404.module.scss'

const NotFound = () => {
  // eslint-disable-next-line no-unused-vars
  const { userAuth, setUserAuth } = useContext(AuthContext)

  const router = useRouter()

  const handleRedirect = () => {
    if (userAuth.auth) {
      router.push('/dashboard')
    }
    router.push('/')
  }

  return (
    <div className={styles.notFound}>
      <img src="./images/indi-central-logo.png" alt="Indi Central Logo" />
      <div className={styles.illustration}>
        <img src="./images/404.svg" alt="404 Error" />
      </div>
      <h1>Sorry, page not found.</h1>
      <h3>Click below to get back to Login or Dashboard</h3>
      <Button sizing="large" label="Get me out of here" color="highlight" isCentered action={handleRedirect} />
    </div>
  )
}

export default NotFound
