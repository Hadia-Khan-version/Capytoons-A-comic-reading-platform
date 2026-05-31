import * as chapterService from '../services/chapter.service.js'
import { sendSuccess }     from '../utils/response.js'
import { asyncHandler }    from '../utils/asyncHandler.js'

export const getChaptersByComicId = asyncHandler(async (req, res) => {
  const { order = 'ASC' } = req.query
  const chapters = await chapterService.getChaptersByComicId(
    req.params.comicId,
    order
  )
  sendSuccess(res, { data: chapters })
})

export const getChapterWithPages = asyncHandler(async (req, res) => {
  const { chapter, pages } = await chapterService.getPagesByChapterId(
    req.params.chapterId
  )
  const adjacent = await chapterService.getAdjacentChapters(
    req.params.chapterId
  )
  sendSuccess(res, { data: { chapter, pages, ...adjacent } })
})