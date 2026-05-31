import api from './api'

export const getTrending   = (limit = 10) =>
  api.get(`/comics/trending?limit=${limit}`).then(r => r.data.data)

export const getMostViewed = (limit = 20) =>
  api.get(`/comics/most-viewed?limit=${limit}`).then(r => r.data.data)

export const getRecent     = (limit = 20) =>
  api.get(`/comics/recent?limit=${limit}`).then(r => r.data.data)

export const getAllGenres   = () =>
  api.get('/comics/genres').then(r => r.data.data)

export const getComicById  = (id) =>
  api.get(`/comics/${id}`).then(r => r.data.data)

export const searchComics  = (params) =>
  api.get('/comics/search', { params }).then(r => r.data)

export const getSuggestions = (q) =>
  api.get('/search/suggestions', { params: { q } }).then(r => r.data.data)