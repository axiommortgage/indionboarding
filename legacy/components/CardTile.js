import Moment from 'react-moment'
import style from '../styles/CardTile.module.scss'

const CardTile = (props) => {
  const {
    icon,
    color,
    title,
    linkUrl,
    openInBlank,
    clickEvent,
  } = props

  const handleColor = () => {
    switch (color) {
      case 'purple':
        return style.purple
      case 'orange':
        return style.orange
      case 'blue':
        return style.blue
      case 'lightblue':
        return style.lightBlue
      case 'green':
        return style.green
      case 'grassgreen':
          return style.grassgreen
      case 'yellow':
        return style.yellow
      case 'teal':
        return style.teal
      case 'dark':
        return style.dark
      case 'gradientgreen':
        return style.gradientGreen
      case 'gradientpurple':
        return style.gradientPurple
      case 'gradientred':
        return style.gradientRed
      case 'gradientteal':
        return style.gradientTeal
      case 'gradientblue':
        return style.gradientBlue
      case 'gradientbluedark':
        return style.gradientBlueDark
      case 'gradientbronze':
        return style.gradientBronze
      case 'gradientlilac':
        return style.gradientLilac
      case 'gradientpink':
        return style.gradientPink
      case 'gradientyellow':
        return style.gradientYellow
      case 'gradientdark':
        return style.gradientDark
      case 'transparent':
        return style.transparent
      default:
    }
  }

  const cardColor = handleColor()

  return (
    <div className={style.cardTile} onClick={clickEvent}>
        <div className={`${style.cardBody} ${cardColor}`}>
          <img src={icon} alt="icon" />
        </div>  
        <h3>{title}</h3>                 
    </div>
  )
}

export default CardTile
