import style from '../styles/BusinessCard.module.scss'

const BusinessCardFront = (props) => {
  const { data } = props
  const {
    cardFrontStyle,
    facebook,
    twitter,
    linkedin,
    instagram,
    workPhone,
    workEmail,
    website,
    titles,
    firstname,
    lastname,
    middlename,
    position,
    photo,
    license
  } = data

  return (
    <div
      className={`${style.businessCardFront} ${cardFrontStyle === 'front1' ? style.front1 : ''} ${
        cardFrontStyle === 'front2' ? style.front2 : ''
      }`}
    >
      {cardFrontStyle === 'front2' ? (
        <div className={style.frontDesign}>
          <img src={'../images/bg-front2.svg'} alt="front2" />
        </div>
      ) : (
        ''
      )}
      {cardFrontStyle === 'front2' ? (
        <div className={style.photo}>
          <img src={photo} alt="photo" />
        </div>
      ) : (
        ''
      )}
      <div className={style.heading}>
        <h2>
          {firstname ? firstname : ''}
          {middlename ? ` ${middlename}` : ''}
          {lastname ? ` ${lastname}` : ''}
          {titles ? <span>{`, ${titles}`}</span> : ''}
        </h2>
        {position ? <h3>{position}</h3> : ''}
      </div>
      <div className={style.contact}>
        {workPhone ? (
          <p>
            <img src="../images/ico-phone.svg" alt="phone" /> {workPhone}
          </p>
        ) : (
          ''
        )}
        {workEmail ? (
          <p>
            <img src="../images/ico-envelope.svg" alt="email" /> {workEmail}
          </p>
        ) : (
          ''
        )}
        {website ? (
          <p>
            <img src="../images/ico-globe.svg" alt="website" /> {website}
          </p>
        ) : (
          ''
        )}
        {license ? <p>License {license}</p> : ''}
      </div>

      <div className={style.social}>
        <p>
          {facebook ? (
            <span>
              {' '}
              <img src="../images/ico-facebook.svg" alt="facebook" />
              {facebook}
            </span>
          ) : (
            ''
          )}
          {instagram ? (
            <span>
              <img src="../images/ico-instagram.svg" alt="instagram" />
              {instagram}
            </span>
          ) : (
            ''
          )}
          {twitter ? (
            <span>
              <img src="../images/ico-twitter.svg" alt="twitter" /> {twitter}
            </span>
          ) : (
            ''
          )}
          {linkedin ? (
            <span>
              {' '}
              <img src="../images/ico-linkedin.svg" alt="linkedin" /> {linkedin}{' '}
            </span>
          ) : (
            ''
          )}
        </p>
      </div>
    </div>
  )
}

export default BusinessCardFront
