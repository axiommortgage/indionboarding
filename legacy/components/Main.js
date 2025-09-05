import { Container, Row, Col } from 'react-grid-system'
import styles from '../styles/Main.module.scss'

const Main = (props) => {
  const { children, fullpage } = props
  return (
    <>
      {fullpage ? (
        <main className={styles.fullpage}>{children}</main>
      ) : (
        <main className={styles.ax_main}>
          <Container>
            <Row>
              <Col sm={12}></Col>
            </Row>
          </Container>
          {children}
        </main>
      )}
    </>
  )
}

export default Main
