import { useContext } from 'react'
import Layout from '../components/Layout'
import { serializeJson } from '../helpers/serializeData'
import TeamChart from '../components/TeamChart'
import style from '../styles/SupportTeam.module.scss'
import nookies from 'nookies'
import Modal from '../components/Modal'
import ModalInfoContext from '../context/modalInfoContext'
import axios from 'axios'

const SupportTeam = (props) => {
  const { team } = props
  const { modalInfo } = useContext(ModalInfoContext)
  const { showModal, content, userVCard } = modalInfo

  return (
    <Layout fullpage toast={{ showToast: false, message: '' }}>
      <Modal
        title="Contact Info"
        isVisible={showModal && showModal !== null ? showModal : false}
        content={content}
        vcard={userVCard}
      />
      <div className={style.pageContent}>
        <section className={style.content} fluid>
          <h1 className={style.ax_page_title} style={{ marginBottom: '54px', textAlign: 'center' }}>
            Head Office Organization Chart
          </h1>
          <TeamChart team={team} />
        </section>
      </div>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const tokens = nookies.get(ctx)
  const { jwt, userId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const team = await axios
      .get(`${apiUrl}/head-office-organization-chart`, config)
      .then((res) => {
        const data = res.data
        const serializedData = serializeJson(data)
        return serializedData
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        team
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

export default SupportTeam
