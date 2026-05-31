import {
  query,
  queryOne,
  insert,
  execute,
  buildPagination,
} from '../db/index.js'
import { notFound } from '../utils/AppError.js'

// ── Helpers ───────────────────────────────────────

/**
 * Fetch genres for a single comic
 */
const getComicGenres = async (comicId) => {
  return query(
    `SELECT g.GenreID, g.GenreName
     FROM Genre g
     INNER JOIN ComicGenre cg ON g.GenreID = cg.GenreID
     WHERE cg.ComicID = ?`,
    [comicId]
  )
}

/**
 * Attach genres array to a comic object
 */
const withGenres = async (comic) => {
  if (!comic) return null
  const genres = await getComicGenres(comic.ComicID)
  return { ...comic, genres }
}

/**
 * Attach genres to an array of comics efficiently
 * Fetches all genres in one query instead of N queries
 */
const withGenresBatch = async (comics) => {
  if (!comics.length) return []

  const ids = comics.map((c) => c.ComicID)
  const placeholders = ids.map(() => '?').join(',')

  const genreRows = await query(
    `SELECT cg.ComicID, g.GenreID, g.GenreName
     FROM Genre g
     INNER JOIN ComicGenre cg ON g.GenreID = cg.GenreID
     WHERE cg.ComicID IN (${placeholders})`,
    ids
  )

  // Group genres by ComicID
  const genreMap = {}
  for (const row of genreRows) {
    if (!genreMap[row.ComicID]) genreMap[row.ComicID] = []
    genreMap[row.ComicID].push({
      GenreID:   row.GenreID,
      GenreName: row.GenreName,
    })
  }

  return comics.map((comic) => ({
    ...comic,
    genres: genreMap[comic.ComicID] || [],
  }))
}

// ── Get All Comics (paginated) ────────────────────

export const getAllComics = async ({ page = 1, limit = 20 }) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL, c.Status,
       c.Type, c.Language, c.AverageRating, c.ReleaseYear,
       a.Name AS AuthorName,
       cv.TotalViews, cv.WeeklyViews
     FROM Comic c
     LEFT JOIN Author    a  ON c.AuthorID  = a.AuthorID
     LEFT JOIN ComicView cv ON c.ComicID   = cv.ComicID
     ORDER BY c.ComicID DESC
     ${limitClause}`,
    []
  )

  const [countRow] = await query('SELECT COUNT(*) AS total FROM Comic', [])

  return {
    data:  await withGenresBatch(comics),
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}

// ── Get Single Comic Detail ───────────────────────

export const getComicById = async (comicId, userId = null) => {
  const comic = await queryOne(
    `SELECT
       c.*,
       a.Name        AS AuthorName,
       a.Nationality AS AuthorNationality,
       cv.TotalViews,
       cv.WeeklyViews
     FROM Comic c
     LEFT JOIN Author    a  ON c.AuthorID  = a.AuthorID
     LEFT JOIN ComicView cv ON c.ComicID   = cv.ComicID
     WHERE c.ComicID = ?`,
    [comicId]
  )

  if (!comic) throw notFound('Comic not found')

  // Attach genres
  const genres = await getComicGenres(comicId)

  // If user is logged in check if bookmarked
  let isBookmarked = false
  let lastReadChapter = null

  if (userId) {
    const bookmark = await queryOne(
      `SELECT 1 FROM Bookmark WHERE UserID = ? AND ComicID = ?`,
      [userId, comicId]
    )
    isBookmarked = !!bookmark

    // Get last read chapter for "continue reading"
    const history = await queryOne(
      `SELECT rh.LastChapterID, ch.ChapterNumber, ch.Title AS ChapterTitle
       FROM ReadingHistory rh
       INNER JOIN Chapter ch ON rh.LastChapterID = ch.ChapterID
       WHERE rh.UserID = ? AND rh.ComicID = ?`,
      [userId, comicId]
    )
    lastReadChapter = history || null
  }

  // Increment total views
  // Increment total views + weekly views
  await execute(
    `UPDATE ComicView 
     SET TotalViews  = TotalViews  + 1,
         WeeklyViews = WeeklyViews + 1
     WHERE ComicID = ?`,
  [comicId]
)

  return {
    ...comic,
    genres,
    isBookmarked,
    lastReadChapter,
  }
}

// ── Trending Comics ───────────────────────────────

export const getTrendingComics = async (limit = 10) => {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL, c.Description,
       c.Status, c.Type, c.AverageRating,
       cv.TotalViews, cv.WeeklyViews
     FROM Comic c
     INNER JOIN ComicView cv ON c.ComicID = cv.ComicID
     ORDER BY cv.TotalViews DESC
     LIMIT ${safeLimit}`,
    []
  )
  return withGenresBatch(comics)
}

// ── Most Viewed Comics ────────────────────────────

export const getMostViewedComics = async (limit = 20) => {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 20))
  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL,
       c.Status, c.Type, c.AverageRating,
       cv.TotalViews, cv.WeeklyViews
     FROM Comic c
     INNER JOIN ComicView cv ON c.ComicID = cv.ComicID
     ORDER BY cv.TotalViews DESC
     LIMIT ${safeLimit}`,
    []
  )
  return withGenresBatch(comics)
}

// ── Recently Added Comics ─────────────────────────

export const getRecentComics = async (limit = 20) => {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 20))
  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL,
       c.Status, c.Type, c.AverageRating,
       c.ReleaseYear
     FROM Comic c
     ORDER BY c.ComicID DESC
     LIMIT ${safeLimit}`,
    []
  )
  return withGenresBatch(comics)
}

// ── Comics By Genre ───────────────────────────────

export const getComicsByGenre = async (genreId, { page = 1, limit = 20 }) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL,
       c.Status, c.Type, c.AverageRating,
       cv.TotalViews
     FROM Comic c
     INNER JOIN ComicGenre cg ON c.ComicID  = cg.ComicID
     LEFT JOIN  ComicView  cv ON c.ComicID  = cv.ComicID
     WHERE cg.GenreID = ?
     ORDER BY c.AverageRating DESC
     ${limitClause}`,
    [genreId]
  )

  const [countRow] = await query(
    `SELECT COUNT(*) AS total
     FROM ComicGenre WHERE GenreID = ?`,
    [genreId]
  )

  return {
    data:  await withGenresBatch(comics),
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}

// ── All Genres ────────────────────────────────────

export const getAllGenres = async () => {
  return query(
    `SELECT g.GenreID, g.GenreName,
            COUNT(cg.ComicID) AS ComicCount
     FROM Genre g
     LEFT JOIN ComicGenre cg ON g.GenreID = cg.GenreID
     GROUP BY g.GenreID, g.GenreName
     ORDER BY g.GenreName ASC`,
    []
  )
}

// ── Search Comics ─────────────────────────────────

export const searchComics = async ({
  q       = '',
  status,
  type,
  language,
  genreId,
  sortBy  = 'AverageRating',
  order   = 'DESC',
  page    = 1,
  limit   = 20,
}) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const allowedSort = ['AverageRating', 'TotalViews', 'Title', 'ReleaseYear']
  const safeSort    = allowedSort.includes(sortBy) ? sortBy : 'AverageRating'
  const safeOrder   = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

  const params = []
  const conditions = []

  if (q) {
    conditions.push('c.Title LIKE ?')
    params.push(`%${q}%`)
  }
  if (status) {
    conditions.push('c.Status = ?')
    params.push(status)
  }
  if (type) {
    conditions.push('c.Type = ?')
    params.push(type)
  }
  if (language) {
    conditions.push('c.Language = ?')
    params.push(language)
  }
  if (genreId) {
    conditions.push('EXISTS (SELECT 1 FROM ComicGenre cg2 WHERE cg2.ComicID = c.ComicID AND cg2.GenreID = ?)')
    params.push(genreId)
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const orderClause = safeSort === 'TotalViews'
    ? `ORDER BY cv.TotalViews ${safeOrder}`
    : `ORDER BY c.${safeSort} ${safeOrder}`

  const comics = await query(
    `SELECT
       c.ComicID, c.Title, c.CoverImageURL,
       c.Status, c.Type, c.Language,
       c.AverageRating, c.ReleaseYear,
       a.Name AS AuthorName,
       cv.TotalViews
     FROM Comic c
     LEFT JOIN Author    a  ON c.AuthorID  = a.AuthorID
     LEFT JOIN ComicView cv ON c.ComicID   = cv.ComicID
     ${whereClause}
     ${orderClause}
     ${limitClause}`,
    params
  )

  // Count query
  const countParams = [...params]
  const [countRow]  = await query(
    `SELECT COUNT(*) AS total
     FROM Comic c
     LEFT JOIN ComicView cv ON c.ComicID = cv.ComicID
     ${whereClause}`,
    countParams
  )

  return {
    data:  await withGenresBatch(comics),
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}