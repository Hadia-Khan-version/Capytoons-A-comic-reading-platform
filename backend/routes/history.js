const express  = require("express");
const router   = express.Router();
const db       = require("../db");
const authMiddleware = require("../middleware/auth");

// Get reading history for logged in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const [history] = await db.execute(`
            SELECT c.ComicID, c.Title, c.CoverImageURL, c.Type,
                   c.Status, rh.LastReadAt,
                   ch.ChapterNumber AS LastChapterNumber
            FROM ReadingHistory rh
            JOIN Comic c ON rh.ComicID = c.ComicID
            LEFT JOIN Chapter ch ON rh.LastChapterID = ch.ChapterID
            WHERE rh.UserID = ?
            ORDER BY rh.LastReadAt DESC
        `, [req.user.userID]);

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Update reading history
router.post("/", authMiddleware, async (req, res) => {
    const { comicID, chapterID } = req.body;
    try {
        await db.execute(`
            INSERT INTO ReadingHistory (UserID, ComicID, LastChapterID)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE LastChapterID = ?, LastReadAt = NOW()
        `, [req.user.userID, comicID, chapterID, chapterID]);

        res.json({ message: "History updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update history" });
    }
});

module.exports = router;