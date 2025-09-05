import { useContext, useState, useEffect } from 'react'
import NotificationsContext from '../context/notificationsContext'
import styles from '../styles/Notifications.module.scss'
import alerts from '../styles/ToastsAlerts.module.scss'
import Moment from 'react-moment'
import Markdown from './Markdown'
import Cookies from 'js-cookie'
import {UilTimes} from '@iconscout/react-unicons'

const Notifications = (props) => {
  const { isopen } = props
  const [dismissedNotes, setDismissedNotes] = useState([])
  const { notifications } = useContext(NotificationsContext)
  const items = notifications.notfs
  let filteredDismiss

  if(items !== null){
    filteredDismiss  = items.filter(x => !dismissedNotes.includes(x.id));
  }

  const handleDismissNotification = async (e, id) => {
    setDismissedNotes([...dismissedNotes, id])
  }

  useEffect(() => {
    if(dismissedNotes.length > 0){
      Cookies.set('dismissed_notes', JSON.stringify(dismissedNotes))
    }
  }, [dismissedNotes])


  useEffect(() => {
    let dismissed = Cookies.get('dismissed_notes')
    if(dismissed !== undefined){
      setDismissedNotes(JSON.parse(dismissed))
    }
  }, [])


  return (
    <div
      className={`${styles.ax_notification_list} ${
        isopen ? styles.ax_notifications_visible : styles.ax_notifications_hidden
      }`}
    >
      {filteredDismiss && filteredDismiss.length > 0 ? (
        filteredDismiss.map((item) => (
          <div className={alerts.ax_tip} key={item.title} onClick={(e) => handleDismissNotification(e, item.id)}>
            <button className={styles.dismiss}><UilTimes size={14} /></button>
            <h3>{item.title}</h3>
            <small>
              <Moment format="MMMM DD, YYYY">{item.createdAt}</Moment>
            </small>
            <Markdown>{item.content}</Markdown>
          </div>
        ))
      ) : (
        <h3>There are no new notifications.</h3>
      )}
    </div>
  )
}

export default Notifications
