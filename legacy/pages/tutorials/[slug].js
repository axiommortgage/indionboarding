import Head from 'next/head'
import axios from 'axios'
import nookies from 'nookies'
import Moment from 'react-moment'
import Layout from '../../components/Layout'
import Markdown from '../../components/Markdown'
import style from '../../styles/Posts.module.scss'

const Notifications = (props) => {
  const { pageData } = props
  const tutorial = pageData[0]

  const refineVideoUrl = () => {
    const newVideoUrl = tutorial.videoUrl.replace('vimeo.com', 'player.vimeo.com/video')
    const videoUrl = newVideoUrl.replace(
      newVideoUrl.substr(newVideoUrl.lastIndexOf('/')),
      '?h=0f0034f3c7&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
    )
    return videoUrl
  }

  return (
    <>
      <Head>
        <script src="https://player.vimeo.com/api/player.js" />
      </Head>
      <Layout toast={{ showToast: false, message: '' }}>
        <article className={style.article}>
          <header className={style.heading}>
            <h2>{tutorial.title}</h2>
            <h3>
              <span>Last update:</span>{' '}
              <Moment format="MMMM DD, YYYY">{tutorial.updatedAt ? tutorial.updatedAt : tutorial.published_at}</Moment>
            </h3>
          </header>

          <div className={style.contentBody}>
            {tutorial && tutorial.videoUrl ? (
              <div className={style.videoEmbedContainer} style={{ margin: '32px 0' }}>
                <iframe
                  title={tutorial.title}
                  src={refineVideoUrl()}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  webkitAllowFullScreen
                  mozallowfullscreen
                  allowFullScreen
                />
              </div>
            ) : (
              ''
            )}

            {tutorial.content && tutorial.content.length > 0 ? <Markdown>{tutorial.content}</Markdown> : ''}
          </div>
        </article>
      </Layout>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const tokens = nookies.get(ctx)
  const { jwt } = tokens
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  if (ctx.req.headers.cookie && jwt) {
    const { slug } = ctx.params

    const pageData = await axios
      .get(`${API_URL}/tutorials?slug_eq=${slug}`, config)
      .then((res) => {
        const tutorials = res.data
        return tutorials
      })
      .catch((err) => {
        throw err
      })

    return {
      props: {
        pageData
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
