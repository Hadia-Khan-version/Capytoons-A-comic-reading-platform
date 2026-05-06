const express  = require("express");
const router   = express.Router();
const db       = require("../db");
const authMiddleware = require("../middleware/auth");

// Submit a review
router.post("/", authMiddleware, async (req, res) => {
    const { comicID, rating, reviewText } = req.body;
    try {
        await db.execute(`
            INSERT INTO Review (UserID, ComicID, Rating, ReviewText)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE Rating = ?, ReviewText = ?, ReviewDate = NOW()
        `, [req.user.userID, comicID, rating, reviewText, rating, reviewText]);

        // Recalculate average rating
        await db.execute(`
            UPDATE Comic SET AverageRating = (
                SELECT ROUND(AVG(Rating), 1)
                FROM Review WHERE ComicID = ?
            ) WHERE ComicID = ?
        `, [comicID, comicID]);

        res.json({ message: "Review submitted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit review" });
    }
});

module.exports = router;