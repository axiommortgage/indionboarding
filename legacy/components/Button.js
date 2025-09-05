import Link from 'next/link'
import style from '../styles/Button.module.scss'

const Button = (props) => {
  const {
    icon,
    iconPos,
    align,
    id,
    disabled,
    sizing,
    isLink,
    linkPath,
    label,
    color,
    isCentered,
    isWide,
    blank,
    isDownload,
    action
  } = props

  const colorClass = () => {
    switch (color) {
      case 'highlight':
        return style.ax_btn_highlight
      case 'bright':
        return style.ax_btn_bright
      case 'gray':
        return style.ax_btn_gray
      case 'dark':
        return style.ax_btn_dark
      default:
        return style.ax_btn_base
    }
  }

  const centeredClass = () => (isCentered ? style.ax_btn_centered : '')

  const wideClass = () => (isWide ? style.ax_btn_wide : '')

  const blankTarget = () => (blank ? '_blank' : '_self')

  const downloadable = () => (isDownload ? true : false)

  const isDisabledClass = () => (disabled ? style.disabled : '')

  const alignment = () => {
    if (align && align.length > 0 && align === 'left') {
      return style.left
    }
    if (align && align.length > 0 && align === 'right') {
      return style.right
    }
    return ''
  }

  const iconPosition = () => {
    if (iconPos && iconPos.length > 0 && iconPos === 'left') {
      return style.icon_left
    }
    if (iconPos && iconPos.length > 0 && iconPos === 'right') {
      return style.icon_right
    }
    return ''
  }

  const sizeClass = () => {
    switch (sizing) {
      case 'xsmall':
        return style.ax_btn_xsmall
      case 'small':
        return style.ax_btn_small
      case 'medium':
        return style.ax_btn_medium
      case 'large':
        return style.ax_btn_large
      case 'xlarge':
        return style.ax_btn_xlarge
      default:
        return style.ax_btn_medium
    }
  }

  if (isLink) {
    if (iconPos) {
      return (
        <Link href={linkPath} legacyBehavior>
          <a
            className={`${
              style.ax_btn
            } ${sizeClass()} ${colorClass()} ${centeredClass()} ${wideClass()} ${isDisabledClass()} ${alignment()} ${iconPosition()}`}
            target={blankTarget()}
            download={downloadable()}
            id={id}
          >
            {iconPos === 'left' ? icon : ''}
            {label}
            {iconPos === 'right' ? icon : ''}
          </a>
        </Link>
      )
    }
    return (
      <Link href={linkPath} legacyBehavior>
        <a
          className={`${
            style.ax_btn
          } ${sizeClass()} ${colorClass()} ${centeredClass()} ${wideClass()} ${isDisabledClass()} ${alignment()}`}
          target={blankTarget()}
          download={downloadable()}
          id={id}
        >
          {label}
          {icon ? icon : ''}
        </a>
      </Link>
    )
  }

  if (iconPos) {
    return (
      <button
        type="button"
        className={`${
          style.ax_btn
        } ${sizeClass()} ${colorClass()} ${centeredClass()} ${wideClass()}  ${isDisabledClass()} ${alignment()} ${iconPosition()}`}
        onClick={action}
        disabled={disabled}
        id={id}
      >
        {iconPos === 'left' ? icon : ''}
        {label}
        {iconPos === 'right' ? icon : ''}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`${
        style.ax_btn
      } ${sizeClass()} ${colorClass()} ${centeredClass()} ${wideClass()}  ${isDisabledClass()} ${alignment()}`}
      onClick={action}
      disabled={disabled}
      id={id}
    >
      {label}
      {icon ? icon : ''}
    </button>
  )
}

export default Button
