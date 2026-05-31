import * as comicService from '../services/comic.service.js'
import { sendSuccess, sendPaginated } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllComics = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const result = await comicService.getAllComics({ page, limit })
  sendPaginated(res, result)
})

export const getComicById = asyncHandler(async (req, res) => {
  const userId = req.user?.UserID || null
  const comic  = await comicService.getComicById(req.params.id, userId)
  sendSuccess(res, { data: comic })
})

export const getTrending = asyncHandler(async (req, res) => {
  const limit  = parseInt(req.query.limit) || 10
  const comics = await comicService.getTrendingComics(limit)
  sendSuccess(res, { data: comics })
})

export const getMostViewed = asyncHandler(async (req, res) => {
  const limit  = parseInt(req.query.limit) || 20
  const comics = await comicService.getMostViewedComics(limit)
  sendSuccess(res, { data: comics })
})

export const getRecent = asyncHandler(async (req, res) => {
  const limit  = parseInt(req.query.limit) || 20
  const comics = await comicService.getRecentComics(limit)
  sendSuccess(res, { data: comics })
})

export const getComicsByGenre = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const result = await comicService.getComicsByGenre(
    req.params.genreId,
    { page, limit }
  )
  sendPaginated(res, result)
})

export const getAllGenres = asyncHandler(async (req, res) => {
  const genres = await comicService.getAllGenres()
  sendSuccess(res, { data: genres })
})

export const searchComics = asyncHandler(async (req, res) => {
  const {
    q, status, type, language,
    genreId, sortBy, order,
    page = 1, limit = 20,
  } = req.query

  const result = await comicService.searchComics({
    q, status, type, language,
    genreId, sortBy, order,
    page, limit,
  })
  sendPaginated(res, result)
})