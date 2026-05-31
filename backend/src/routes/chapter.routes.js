import { Router } from 'express'
import * as ctrl  from '../controllers/chapter.controller.js'

const router = Router()

// GET /api/chapters/:comicId
// Returns all chapters for a comic
router.get('/:comicId', ctrl.getChaptersByComicId)

// GET /api/chapters/:comicId/:chapterId/pages
// Returns pages + prev/next chapter info
router.get('/:comicId/:chapterId/pages', ctrl.getChapterWithPages)

export default router