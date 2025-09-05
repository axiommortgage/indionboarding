import { useState, useEffect, useContext } from 'react'
import VCardCreator from 'vcard-creator'
import ModalInfoContext from '../context/modalInfoContext'

import style from '../styles/UserVCard.module.scss'

const UserVCard = (props) => {
  const { member, level } = props
  const { fullname, position, position2, user } = member
  const [showModal, setShowModal] = useState(false)
  const { setModalInfo } = useContext(ModalInfoContext)

  const content = {
    fullname,
    position,
    email: user.email,
    phone: user.workPhone ? user.workPhone : user.phone ? user.phone : '',
    photo: user && user.photo && user.photo.url ? user.photo.url : ''
  }

  const myVCard = new VCardCreator()

  myVCard
    .addName(fullname)
    .addCompany('Indi Mortgage')
    .addJobtitle(position ? position : '')
    .addRole(user && user.titles ? user.titles : '')
    .addEmail(user && user.email ? user.email : '')
    .addPhoneNumber(user && user.phone ? user.phone : '', 'PREF;WORK')
    .addPhoto(user && user.photo && user.photo.url ? user.photo.url : '', 'JPEG')

  const userVCard = myVCard.toString()

  const handleToggleModal = (e) => {
    setShowModal(!showModal)
  }

  useEffect(() => {
    setModalInfo({ showModal, content, userVCard })
  }, [showModal])

  return (
    <>
      <div className={`${style.cardUser} ${style[level]}`} id={user.id}>
        <div className={style.cardContainer}>
          <button className={style.overlay} onClick={(e) => handleToggleModal(e)}>
            <p>See Contact Info</p>
          </button>
          <div
            className={style.photo}
            style={{ backgroundImage: `url(${user && user.photo && user.photo.url ? user.photo.url : ''})` }}
            alt="photo"
          ></div>

          <div className={style.cardBody}>
            <h3>{`${fullname ? fullname : ''}`}</h3>
            {position ? <h4>{position}</h4> : ''}
            {position2 ? <h4>{position2}</h4> : ''}
          </div>
        </div>
      </div>
    </>
  )
}

export default UserVCard
