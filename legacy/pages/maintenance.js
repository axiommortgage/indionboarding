import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/404.module.scss'

const Maintenance = () => {
  return (
    <>
      <Head>
        <title>Under Maintenance - Indi Central</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div
        className={styles.notFound}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Image
          src="/images/indi-onboarding-logo.png"
          alt="Indi Central Logo"
          width={140}
          height={116}
          priority
          style={{ width: '140px', height: 'auto', marginBottom: '2rem' }}
        />

        <div className={styles.illustration}>
          <Image
            src="/images/maintenance.png"
            alt="Under Maintenance"
            width={280}
            height={172}
            priority
            style={{ width: '280px', height: 'auto', margin: '0 auto 2rem' }}
          />
        </div>

        <h1
          style={{
            marginBottom: '1rem',
            fontSize: '2.5rem',
            color: '#333'
          }}
        >
          Under Maintenance
        </h1>

        <h3
          style={{
            fontWeight: '400',
            maxWidth: '600px',
            lineHeight: '1.6',
            color: '#666'
          }}
        >
          We are performing scheduled system updates to improve your experience. Please check back after{' '}
          <strong>{process.env.MAINTENANCE_END_TIME || 'a few hours'}</strong>.
        </h3>
      </div>
    </>
  )
}

export default Maintenance
