const express = require("express");
const router  = express.Router();
const db      = require("../db");

// Get all pages for a chapter
router.get("/:id/pages", async (req, res) => {
    const { id } = req.params;
    try {
        const [pages] = await db.execute(`
            SELECT PageID, PageNumber, ImageURL
            FROM Page
            WHERE ChapterID = ?
            ORDER BY PageNumber ASC
        `, [id]);

        if (pages.length === 0)
            return res.status(404).json({ error: "No pages found for this chapter" });

        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pages" });
    }
});

module.exports = router;