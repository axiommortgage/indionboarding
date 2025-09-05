import { useState, useContext, useEffect } from 'react'
import ModalInfoContext from '../context/modalInfoContext'
import style from '../styles/Modal.module.scss'

const Modal = (props) => {
  const { title, isVisible, content, vCard } = props
  const [showModal, setShowModal] = useState(null)
  const { modalInfo, setModalInfo } = useContext(ModalInfoContext)

  const handleClose = () => {
    setShowModal(false)
  }

  const handleSaveVcard = (e) => {
    e.preventDefault()
    const element = document.createElement('a')
    const file = new Blob([vCard], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `${content.fullname}-vcard.vcf`
    document.body.appendChild(element)
    element.click()
  }

  useEffect(() => {
    if (showModal === false) {
      setModalInfo({ ...modalInfo, showModal: false })
    }
  }, [showModal])

  useEffect(() => {
    setShowModal(isVisible)
  }, [isVisible])

  if (isVisible) {
    const { fullname, position, email, phone, photo, vCard } = content
    return (
      <>
        <button
          className={`${style.modalOverlay} ${showModal ? style.isVisible : ''}`}
          onClick={(e) => handleClose(e)}
        ></button>
        <div className={`${style.modal} ${showModal ? style.modalOpened : ''}`}>
          {/* <header>
            <h2>{title}</h2>
          </header> */}
          <div className={style.content}>
            <div className={style.photo} style={{ backgroundImage: `url(${photo ? photo : ''})` }}></div>
            <div className={style.contentBody}>
              <h2>{fullname ? fullname : ''}</h2>
              <h3>{position ? position : ''}</h3>
              <p>
                <strong>Email:</strong> {email ? email : ''}
              </p>
              <p>
                <strong>Phone:</strong> {phone ? phone : ''}
              </p>
            </div>
          </div>
          <footer>
            <button onClick={(e) => handleSaveVcard(e)}>Save VCard</button>
          </footer>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={style.modalOverlay}></div>
    </>
  )
}

export default Modal
