const formatUrl = (url) => {
  url = url.replace('www.', '').replace('http://', '')

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
    return url
  }
  return url
}

export default formatUrl
