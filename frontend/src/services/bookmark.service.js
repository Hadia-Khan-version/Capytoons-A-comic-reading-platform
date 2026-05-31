import api from './api'

export const getBookmarks    = (params) =>
  api.get('/bookmarks', { params }).then(r => r.data)

export const toggleBookmark  = (comicId, listType = 'reading') =>
  api.post('/bookmarks/toggle', { comicId, listType }).then(r => r.data.data)

export const removeBookmark  = (comicId) =>
  api.delete(`/bookmarks/${comicId}`).then(r => r.data)