import {
  query,
  execute,
  buildPagination,
} from '../db/index.js'

// ── Get Reading History ───────────────────────────

export const getHistory = async (userId, { page = 1, limit = 20 }) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const history = await query(
    `SELECT
       c.ComicID,
       c.Title,
       c.CoverImageURL,
       c.Status,
       c.Type,
       ch.ChapterID      AS LastChapterID,
       ch.ChapterNumber  AS LastChapterNumber,
       ch.Title          AS LastChapterTitle,
       rh.LastReadAt
     FROM ReadingHistory rh
     INNER JOIN Comic   c  ON rh.ComicID       = c.ComicID
     INNER JOIN Chapter ch ON rh.LastChapterID  = ch.ChapterID
     WHERE rh.UserID = ?
     ORDER BY rh.LastReadAt DESC
     ${limitClause}`,
    [userId]
  )

  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM ReadingHistory WHERE UserID = ?`,
    [userId]
  )

  return {
    data:  history,
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}

// ── Save / Update Reading Progress ────────────────
// Uses INSERT ... ON DUPLICATE KEY UPDATE
// so it works for both first-time and updates

export const saveProgress = async (userId, comicId, chapterId) => {
  await execute(
    `INSERT INTO ReadingHistory (UserID, ComicID, LastChapterID, LastReadAt)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       LastChapterID = VALUES(LastChapterID),
       LastReadAt    = NOW()`,
    [userId, comicId, chapterId]
  )
  return { ComicID: comicId, LastChapterID: chapterId }
}

// ── Delete One History Entry ──────────────────────

export const deleteHistoryEntry = async (userId, comicId) => {
  await execute(
    `DELETE FROM ReadingHistory WHERE UserID = ? AND ComicID = ?`,
    [userId, comicId]
  )
  return true
}

// ── Clear All History ─────────────────────────────

export const clearAllHistory = async (userId) => {
  await execute(
    `DELETE FROM ReadingHistory WHERE UserID = ?`,
    [userId]
  )
  return true
}