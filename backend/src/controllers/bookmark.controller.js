import * as bookmarkService from '../services/bookmark.service.js'
import { sendSuccess, sendPaginated } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getUserBookmarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const result = await bookmarkService.getUserBookmarks(
    req.user.UserID,
    { page, limit }
  )
  sendPaginated(res, result)
})

export const addBookmark = asyncHandler(async (req, res) => {
  const { comicId, listType } = req.body
  const bookmark = await bookmarkService.addBookmark(
    req.user.UserID,
    comicId,
    listType
  )
  sendSuccess(res, { data: bookmark }, 'Bookmarked successfully', 201)
})

export const removeBookmark = asyncHandler(async (req, res) => {
  await bookmarkService.removeBookmark(req.user.UserID, req.params.comicId)
  sendSuccess(res, {}, 'Bookmark removed')
})

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { comicId, listType } = req.body
  const result = await bookmarkService.toggleBookmark(
    req.user.UserID,
    comicId,
    listType
  )
  sendSuccess(res, { data: result })
})