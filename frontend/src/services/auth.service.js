import api from './api'

export const register = async ({ username, email, password }) => {
  const res = await api.post('/auth/register', { username, email, password })
  return res.data
}

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export const logout = async () => {
  const res = await api.post('/auth/logout')
  return res.data
}

export const refresh = async (refreshToken) => {
  const res = await api.post('/auth/refresh', { refreshToken })
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}