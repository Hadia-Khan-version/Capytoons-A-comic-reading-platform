import api from './api'

export const getHistory     = (params) =>
  api.get('/history', { params }).then(r => r.data)

export const saveProgress   = (comicId, chapterId) =>
  api.post('/history', { comicId, chapterId }).then(r => r.data)

export const clearHistory   = () =>
  api.delete('/history/all').then(r => r.data)