import axios from 'axios'
import nookies from 'nookies'
import Layout from '../components/Layout'
import { Row, Col } from 'react-grid-system'
import Card from '../components/Card'
import style from '../styles/Posts.module.scss'

const Notifications = (props) => {
  const { tutorials } = props

  return (
    <Layout toast={{ showToast: false, message: '' }}>
      <h1 className={style.ax_page_title}>Tutorials</h1>
      <section className={style.list}>
        <Row style={{ width: '100%' }}>
          {tutorials.length > 0 ? (
            tutorials.map((tutorial) => {
              if (tutorial.category && tutorial.category === 'onboarding') {
                return (
                  <Col sm={12} md={4}>
                    <Card
                      key={tutorial.id}
                      title={tutorial.title}
                      hasButton
                      linkUrl={`/tutorials/${tutorial.slug}`}
                      image={tutorial.thumbnail.url}
                      buttonLabel="View"
                    />
                  </Col>
                )
              }
            })
          ) : (
            <div className={style.listItem}>
              <div className={style.description}>
                <h2>There are no tutorials.</h2>
              </div>
            </div>
          )}
        </Row>
      </section>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const tokens = nookies.get(ctx)
  const { jwt, userId } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const tutorials = await axios
      .get(`${API_URL}/tutorials`, config)
      .then((res) => {
        const { data } = res
        return data
      })
      .catch((err) => {
        throw err
      })

    const user = await axios
      .get(`${API_URL}/users/${userId}`, config)
      .then((res) => {
        const { data } = res
        return data
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        tutorials,
        user
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

export default Notifications
