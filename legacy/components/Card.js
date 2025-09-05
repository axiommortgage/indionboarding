import Moment from 'react-moment'
import style from '../styles/Card.module.scss'
import Button from './Button'
import Switcher from './Switcher'

const CardWithIcon = (props) => {
  const {
    id,
    cardWide,
    icon,
    color,
    photo,
    image,
    iconSquared,
    title,
    description,
    hasButton,
    linkUrl,
    isDownload,
    buttonLabel,
    openInBlank,
    clickEvent,
    date,
    size,
    shadow,
    disabled,
    hasSwitcher,
    switcherValue,
    switcherAction,
    switcherLabel
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
      case 'lightgray':
        return style.lightGray
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
      case 'black':
        return style.black
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
      default:
    }
  }

  const cardColor = handleColor()

  return (
    <div id={id} className={`${size === 'wide' ? style.ax_card_wide : ''} ${size === 'vertical' ? style.ax_card_vertical : ''} ${size === 'small' ? style.ax_card_small : ''} `} onClick={clickEvent}>
      <div className={`${style.ax_card_with_icon} ${cardColor} ${shadow ? style.cardShadow : ''}`}>
        <div
          className={`${icon ? style.ax_card_icon : ''} ${iconSquared ? style.ax_card_icon_squared : ''} ${image ? `${style.ax_card_image} ${style.thumb}` : ''} ${
            photo ? style.ax_card_photo : ''
          }`}
        >
          <img src={`${icon || ''} ${photo || ''} ${image || ''} ${iconSquared || ''}`} alt="icon" />
        </div>
        <div className={style.ax_card_body} style={{ marginBottom: `${hasButton ? '32px' : '  '} ` }}>
          {size === 'small' ? '' : 
          <>
            {title ? <h3>{title}</h3> : ''}
            {description ? <p>{description}</p> : ''}
            </>
          }
          {date ? <p><Moment format="MMMM DD, YYYY">{date}</Moment></p> : ''}

          {hasSwitcher ?         
          <Switcher id={id} label={switcherLabel} name="website" checked={switcherValue} action={e => switcherAction(e)} />
        : ''}
        </div>        

        {hasButton ? (
          <Button disabled={disabled} sizing="small" color="highlight" isLink linkPath={linkUrl} label={buttonLabel} blank={openInBlank} isDownload={isDownload}/>
        ) : (
          ''
        )}
      </div>
      {size === 'small' ? <h3>{title}</h3> : '' }
    </div>
  )
}

export default CardWithIcon
