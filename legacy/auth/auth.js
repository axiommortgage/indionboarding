import Cookies from 'js-cookie'
import Router from 'next/router'

export const authStatus = () => {
  const token = Cookies.get('jwt')
  if (token) {
    return true
  }
  return false
}

export const logout = () => {
  Cookies.remove('jwt')
  Cookies.remove('userId')
  Router.push('/')
}
