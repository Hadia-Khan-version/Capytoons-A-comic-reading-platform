import * as historyService from '../services/history.service.js'
import { sendSuccess, sendPaginated } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const result = await historyService.getHistory(
    req.user.UserID,
    { page, limit }
  )
  sendPaginated(res, result)
})

export const saveProgress = asyncHandler(async (req, res) => {
  const { comicId, chapterId } = req.body
  const result = await historyService.saveProgress(
    req.user.UserID,
    comicId,
    chapterId
  )
  sendSuccess(res, { data: result }, 'Progress saved')
})

export const deleteHistoryEntry = asyncHandler(async (req, res) => {
  await historyService.deleteHistoryEntry(
    req.user.UserID,
    req.params.comicId
  )
  sendSuccess(res, {}, 'History entry removed')
})

export const clearAllHistory = asyncHandler(async (req, res) => {
  await historyService.clearAllHistory(req.user.UserID)
  sendSuccess(res, {}, 'History cleared')
})