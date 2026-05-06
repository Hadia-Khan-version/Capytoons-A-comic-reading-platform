const express  = require("express");
const router   = express.Router();
const db       = require("../db");
const authMiddleware = require("../middleware/auth");

// Get all bookmarks for logged in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const [bookmarks] = await db.execute(`
            SELECT c.ComicID, c.Title, c.CoverImageURL, c.Type,
                   c.Status, c.AverageRating, b.ListType
            FROM Bookmark b
            JOIN Comic c ON b.ComicID = c.ComicID
            WHERE b.UserID = ?
        `, [req.user.userID]);

        res.json(bookmarks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
});

// Add bookmark
router.post("/", authMiddleware, async (req, res) => {
    const { comicID, listType } = req.body;
    try {
        await db.execute(`
            INSERT INTO Bookmark (UserID, ComicID, ListType)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE ListType = ?
        `, [req.user.userID, comicID, listType, listType]);

        res.json({ message: "Bookmark saved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save bookmark" });
    }
});

// Delete bookmark
router.delete("/:comicID", authMiddleware, async (req, res) => {
    const { comicID } = req.params;
    try {
        await db.execute(`
            DELETE FROM Bookmark WHERE UserID = ? AND ComicID = ?
        `, [req.user.userID, comicID]);

        res.json({ message: "Bookmark removed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to remove bookmark" });
    }
});

module.exports = router;