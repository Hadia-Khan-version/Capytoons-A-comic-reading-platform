import api from './api'

export const getChapters = (comicId, order = 'ASC') =>
  api.get(`/chapters/${comicId}?order=${order}`).then(r => r.data.data)

export const getChapterPages = (comicId, chapterId) =>
  api.get(`/chapters/${comicId}/${chapterId}/pages`).then(r => r.data.data)