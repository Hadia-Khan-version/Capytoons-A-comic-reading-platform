import { query, queryOne } from '../db/index.js'
import { notFound }        from '../utils/AppError.js'

const pageCache = new Map()
const CACHE_TTL = 1000 * 60 * 15  // 15 minutes

// ── Get All Chapters For a Comic ──────────────────

export const getChaptersByComicId = async (comicId, order = 'ASC') => {
  const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

  const chapters = await query(
    `SELECT
       ch.ChapterID,
       ch.ComicID,
       ch.ChapterNumber,
       ch.Title,
       ch.UploadDate,
       ch.PageCount
     FROM Chapter ch
     WHERE ch.ComicID = ?
     ORDER BY ch.ChapterNumber ${safeOrder}`,
    [comicId]
  )

  return chapters
}

// ── Get Single Chapter ────────────────────────────

export const getChapterById = async (chapterId) => {
  const chapter = await queryOne(
    `SELECT
       ch.*,
       c.Title  AS ComicTitle,
       c.ComicID
     FROM Chapter ch
     INNER JOIN Comic c ON ch.ComicID = c.ComicID
     WHERE ch.ChapterID = ?`,
    [chapterId]
  )

  if (!chapter) throw notFound('Chapter not found')
  return chapter
}

// ── Get Pages For a Chapter ───────────────────────

export const getPagesByChapterId = async (chapterId) => {
  console.log('📖 getPagesByChapterId called with:', chapterId)
  
  const chapter = await getChapterById(chapterId)
  console.log('📖 Chapter found:', chapter?.ChapterID, '| MangaDexID:', chapter?.MangaDexChapterID)

  const cached = pageCache.get(chapterId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    console.log('📦 Returning cached pages')
    return { chapter, pages: cached.pages }
  }

  if (chapter.MangaDexChapterID) {
    console.log('🌐 Calling MangaDex API...')
    try {
      const response = await fetch(
        `https://api.mangadex.org/at-home/server/${chapter.MangaDexChapterID}`,
        { headers: { 'User-Agent': 'CapyToons/1.0' } }
      )
      console.log('🌐 MangaDex response status:', response.status)

      if (response.ok) {
        const data  = await response.json()
        console.log('🌐 MangaDex baseUrl:', data.baseUrl)
        console.log('🌐 Pages count:', data.chapter?.data?.length)

        const baseUrl = data.baseUrl
        const hash    = data.chapter.hash
        const files   = data.chapter.data

        const pages = files.map((filename, i) => ({
          PageID:     i + 1,
          ChapterID:  parseInt(chapterId),
          PageNumber: i + 1,
          ImageURL:   `${baseUrl}/data/${hash}/${filename}`,
        }))

        pageCache.set(chapterId, { pages, fetchedAt: Date.now() })
        console.log('✅ Pages built successfully, count:', pages.length)
        return { chapter, pages }
      }
    } catch (err) {
      console.error('❌ MangaDex fetch error:', err.message)
    }
  } else {
    console.log('⚠️  No MangaDexChapterID — falling back to DB')
  }

  const pages = await query(
    `SELECT PageID, ChapterID, PageNumber, ImageURL
     FROM Page WHERE ChapterID = ?
     ORDER BY PageNumber ASC`,
    [chapterId]
  )
  console.log('📄 DB pages count:', pages.length)

  return { chapter, pages }
}

// ── Get Prev / Next Chapter ───────────────────────

export const getAdjacentChapters = async (chapterId) => {
  const current = await getChapterById(chapterId)

  const prev = await queryOne(
    `SELECT ChapterID, ChapterNumber, Title
     FROM Chapter
     WHERE ComicID = ? AND ChapterNumber < ?
     ORDER BY ChapterNumber DESC
     LIMIT 1`,
    [current.ComicID, current.ChapterNumber]
  )

  const next = await queryOne(
    `SELECT ChapterID, ChapterNumber, Title
     FROM Chapter
     WHERE ComicID = ? AND ChapterNumber > ?
     ORDER BY ChapterNumber ASC
     LIMIT 1`,
    [current.ComicID, current.ChapterNumber]
  )

  return { prev: prev || null, next: next || null }
}