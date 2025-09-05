import Layout from '../components/Layout'
import { serializeJson } from '../helpers/serializeData'
import style from '../styles/SupportTeam.module.scss'
import nookies from 'nookies'
import axios from 'axios'
import Complete from '../components/Complete'

const Finished = (props) => {
  const { user, onboarding } = props

  return (
    <Layout fullpage toast={{ showToast: false, message: '' }}>
      <section className={style.content}>
        <div style={{ marginBottom: '54px' }}>
          <Complete />
        </div>
      </section>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const tokens = nookies.get(ctx)
  const { jwt, userId, onboardingId } = tokens

  console.log('UID', userId)
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const onboarding = await axios
      .get(`${apiUrl}/onboarding-processes/${onboardingId}`, config)
      .then((res) => {
        const obd = res.data
        const serializedData = serializeJson(obd)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    const user = await axios
      .get(`${apiUrl}/users?id=${userId}`, config)
      .then((res) => {
        const data = res.data[0]
        return data
      })
      .catch((err) => {
        throw err
      })

    if (onboarding.completionPercent !== 100 && onboarding.completionPercent !== '100') {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    return {
      props: {
        user,
        onboarding
      }
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false
    }
  }
}

export default Finished
