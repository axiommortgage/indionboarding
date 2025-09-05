import { useState, useEffect } from 'react'
import Xarrow from 'react-xarrows'
import UserVCard from './VCard'
import style from '../styles/TeamChart.module.scss'

const TeamChart = (props) => {
  const { team } = props
  const [teamCharts, setTeamCharts] = useState([])
  const [lines, setLines] = useState({})
  const lv1 = team.level1.map((tm) => tm)
  const lv2 = team.level2.map((tm) => tm)
  const lv3 = team.level3.map((tm) => tm)
  const lv4 = team.level4.map((tm) => tm)
  const lv5 = team.level5.map((tm) => tm)

  const showTeamMate = (members, level) => {
    const levelMembers = members.userCard
    return levelMembers.map((member) => {
      if (member && member.user && member.user.id) {
        return <UserVCard member={member} level={level} />
      }
    })
  }

  const showCharts = (level) => {
    if (level && level.length > 0) {
      return level.map((tm) => {
        if (tm !== undefined && tm.userCard && tm.userCard.length > 0) {
          return tm.userCard.map((uc) => {
            const { user } = uc

            return uc.child_team_mates.map((c) => {
              if (user && user.id) {
                return (
                  <Xarrow
                    key={c.id}
                    start={user.id}
                    end={c.id}
                    startAnchor="bottom"
                    endAnchor="top"
                    strokeWidth={2}
                    showHead={true}
                    curveness={0.7}
                    color="black"
                    path="smooth"
                  />
                )
              }
              return
            })
          })
        }
      })
    }
    return ''
  }

  useEffect(() => {
    setLines({
      linesLv1: showCharts(lv1),
      linesLv2: showCharts(lv2),
      linesLv3: showCharts(lv3),
      linesLv4: showCharts(lv4),
      linesLv5: showCharts(lv5)
    })
  }, [teamCharts])

  return (
    <div className={style.teamChart}>
      <section className={`${style.level} ${style.right}`}>
        {lines.linesLv1}
        {team && team.level1
          ? team.level1.map((level) => {
              return showTeamMate(level, 'level1')
            })
          : ''}
      </section>
      <section className={`${style.level} ${style.left}`}>
        {lines.linesLv2}
        {team && team.level2
          ? team.level2.map((level) => {
              return showTeamMate(level, 'level2')
            })
          : ''}
      </section>
      <section className={`${style.level}`}>
        {lines.linesLv3}
        {team && team.level3
          ? team.level3.map((level) => {
              return showTeamMate(level, 'level3')
            })
          : ''}
      </section>
      <section className={`${style.level}  ${style.right}`}>
        {lines.linesLv4}
        {team && team.level4
          ? team.level4.map((level) => {
              return showTeamMate(level, 'level4')
            })
          : ''}
      </section>
      <section className={`${style.level}`}>
        {lines.linesLv5}
        {team && team.level5
          ? team.level5.map((level) => {
              return showTeamMate(level, 'level5')
            })
          : ''}
      </section>
    </div>
  )
}

export default TeamChart
