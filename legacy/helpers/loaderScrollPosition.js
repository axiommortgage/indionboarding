const scrollToLoader = (t) => {
  window.scroll({ top: t, left: 0, behavior: 'smooth' })
}

const loaderPosition = (l) => {
  const windowHeight = window.innerHeight
  const loadingContainer = l.current.getBoundingClientRect()
  const loadingIcon = l.current.querySelector('span')
  const top = loadingContainer.height / 2 - 80
  const left = loadingContainer.width / 2 - 80

  scrollToLoader(top)
  return { loadingContainer, loadingIcon: { top, left } }
}

export default loaderPosition
