export const formatPhone = (phone) => {
  if (phone && phone.length > 0 && phone !== undefined && phone !== null) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}`
  }

  return ''
}

export const getRawPhone = (formInfo) => {
  let phonesObj = {}

  for (let item in formInfo) {
    if (formInfo && formInfo[item] && formInfo[item].raw) {
      switch (item) {
        case 'sin':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'phone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'preferredPhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'officePhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'companyPhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'workPhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'emergencyPhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'cellPhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'homePhone':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'tollfree':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        case 'fax':
          phonesObj = { ...phonesObj, [item]: formInfo[item].raw }
          break
        default:
          phonesObj = { ...phonesObj }
          break
      }
    }
  }

  return phonesObj
}
