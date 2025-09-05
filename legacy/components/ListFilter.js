import { useContext, useEffect, useState } from 'react'
import BrokersFilterContext from '../context/brokersFilterContext'
import Cookies from 'js-cookie'
import axios from 'axios'
import Processing from '../components/Processing'
import style from '../styles/Filter.module.scss'

const ListFilter = (props) => {
  const { filterType, filterAction } = props
  const [filtering, setFiltering] = useState(false)
  const [filterTeamsData, setFilterTeamsData] = useState(null)
  const [filterProvincesData, setFilterProvincesData] = useState(null)
  const [teamToFilter, setTeamToFilter] = useState(null)
  const [provinceToFilter, setProvinceToFilter] = useState(null)
  const { brokers, setBrokers } = useContext(BrokersFilterContext)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const jwt = Cookies.get('jwt')
  const config = {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  }

  useEffect(async () => {
    const data = await axios
      .get(`${API_URL}/teams`, config)
      .then((res) => {
        const allteams = res.data
        let teamsArr = []
        let provincesArr = []

        const provinces = allteams.map((item) => {
          if (item.province) {
            let provinceItem = item.province
            provincesArr = [...provincesArr, provinceItem]
            provincesArr = [...new Set(provincesArr)]
          }
        })

        const teams = allteams.map((item) => {
          if (item.province) {
            let teamItem = item.name
            teamsArr = [...teamsArr, teamItem]
            teamsArr = [...new Set(teamsArr)]
          }
        })

        setFilterTeamsData(teamsArr)
        setFilterProvincesData(provincesArr)

        return { provincesArr, teamsArr }
      })
      .catch((err) => {
        setFiltering(false)
        throw err
      })

    return data
  }, [])

  const filterBroker = async (province, team) => {
    setFiltering(true)
    if (province === 'all') {
      const data = await axios
        .get(`${API_URL}/users?_limit=-1`, config)
        .then((res) => {
          const brokers = res.data
          setFiltering(false)
          setBrokers(brokers)
          return brokers
        })
        .catch((err) => {
          setFiltering(false)
          throw err
        })

      return data
    } else {
      const data = await axios
        .get(
          team === '' || team === null || !team
            ? `${API_URL}/users?team.province_contains=${province}&_limit=-1`
            : `${API_URL}/users?team.province_contains=${province}&team.name_contains=${team}&_limit=-1`,
          config
        )
        .then((res) => {
          const brokers = res.data
          setFiltering(false)
          setBrokers(brokers)
          return brokers
        })
        .catch((err) => {
          setFiltering(false)
          throw err
        })

      return data
    }
  }

  const handleFilter = (province, team) => {
    switch (filterType) {
      case 'broker':
        filterBroker(province, team)
        break
      default:
        return
    }
  }

  const handleOptions = () => {
    if (filterProvincesData === null) {
      return <option value="">Loading...</option>
    } else {
      return (
        <>
          <option value="">Select a Province</option>
          <option value="all">All</option>
          {filterProvincesData
            ? filterProvincesData.map((opt) => {
                const result = opt.replace(/([A-Z])/g, ' $1')
                const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
                return (
                  <option key={opt} value={encodeURIComponent(opt.trim())}>
                    {finalResult}
                  </option>
                )
              })
            : 'loading...'}
        </>
      )
    }
  }

  const selectOptions = handleOptions()

  return (
    <div className={`${style.filter} ${style.ax_field}`}>
      <label htmlFor="filter">
        Province:
        <select
          name="filter"
          onChange={(e) => {
            setProvinceToFilter(e.target.value)
          }}
        >
          {selectOptions}
        </select>
      </label>

      {/* <select onChange={e => {setTeamToFilter(e.target.value)}}>
        <option value=''>Select a Team</option>
        {filterTeamsData ? 
          filterTeamsData.map(opt => {
            return(
              <option value={encodeURIComponent(opt.trim())}>{opt}</option>
            )
          })
        : 'loading...'}
      </select> */}
      <button onClick={(e) => handleFilter(provinceToFilter, teamToFilter)}>Filter By Province</button>
      {filtering ? <Processing processing={filtering} /> : ''}
    </div>
  )
}

export default ListFilter
