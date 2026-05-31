import {
  query,
  queryOne,
  execute,
  buildPagination,
} from '../db/index.js'
import { notFound, conflict } from '../utils/AppError.js'

// ── Get All Bookmarks For User ────────────────────

export const getUserBookmarks = async (userId, { page = 1, limit = 20 }) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const bookmarks = await query(
    `SELECT
       c.ComicID,
       c.Title,
       c.CoverImageURL,
       c.Status,
       c.Type,
       c.AverageRating,
       b.ListType,
       -- Last chapter read
       ch.ChapterNumber AS LastChapterNumber,
       rh.LastReadAt
     FROM Bookmark b
     INNER JOIN Comic c ON b.ComicID = c.ComicID
     LEFT JOIN ReadingHistory rh
       ON rh.UserID = b.UserID AND rh.ComicID = b.ComicID
     LEFT JOIN Chapter ch
       ON ch.ChapterID = rh.LastChapterID
     WHERE b.UserID = ?
     ORDER BY rh.LastReadAt DESC
     ${limitClause}`,
    [userId]
  )

  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM Bookmark WHERE UserID = ?`,
    [userId]
  )

  return {
    data:  bookmarks,
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}

// ── Add Bookmark ──────────────────────────────────

export const addBookmark = async (userId, comicId, listType = 'reading') => {
  const existing = await queryOne(
    `SELECT 1 FROM Bookmark WHERE UserID = ? AND ComicID = ?`,
    [userId, comicId]
  )
  if (existing) throw conflict('Comic already bookmarked')

  await execute(
    `INSERT INTO Bookmark (UserID, ComicID, ListType) VALUES (?, ?, ?)`,
    [userId, comicId, listType]
  )

  return { ComicID: comicId, ListType: listType }
}

// ── Remove Bookmark ───────────────────────────────

export const removeBookmark = async (userId, comicId) => {
  const affected = await execute(
    `DELETE FROM Bookmark WHERE UserID = ? AND ComicID = ?`,
    [userId, comicId]
  )
  if (!affected) throw notFound('Bookmark not found')
  return true
}

// ── Toggle Bookmark ───────────────────────────────

export const toggleBookmark = async (userId, comicId, listType = 'reading') => {
  const existing = await queryOne(
    `SELECT 1 FROM Bookmark WHERE UserID = ? AND ComicID = ?`,
    [userId, comicId]
  )

  if (existing) {
    await execute(
      `DELETE FROM Bookmark WHERE UserID = ? AND ComicID = ?`,
      [userId, comicId]
    )
    return { bookmarked: false }
  } else {
    await execute(
      `INSERT INTO Bookmark (UserID, ComicID, ListType) VALUES (?, ?, ?)`,
      [userId, comicId, listType]
    )
    return { bookmarked: true }
  }
}