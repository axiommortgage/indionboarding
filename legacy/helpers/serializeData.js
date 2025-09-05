export const serializeJson = (data) => {
  let serialized = {}
  Object.keys(data).forEach((item) => {
    if (data[item] === null || data[item] === undefined) {
      serialized = { ...serialized, [item]: '' }
    } else {
      serialized = { ...serialized, [item]: data[item] }
    }
  })
  return serialized
}

export const serializeArray = (data) =>
  data.map((obj) => {
    let serialized = {}
    Object.keys(obj).forEach((item) => {
      if (obj[item] === null || obj[item] === undefined) {
        serialized = { ...serialized, [item]: '' }
      } else {
        serialized = { ...serialized, [item]: obj[item] }
      }
    })
    return serialized
  })
