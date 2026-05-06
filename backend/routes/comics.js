const express = require("express");
const router  = express.Router();
const db      = require("../db");

// Home page — trending and most viewed
router.get("/", async (req, res) => {
    try {
        const [trending] = await db.execute(`
            SELECT c.ComicID, c.Title, c.CoverImageURL, c.Type, c.Status,
                   c.AverageRating, cv.WeeklyViews
            FROM Comic c
            JOIN ComicView cv ON c.ComicID = cv.ComicID
            ORDER BY cv.WeeklyViews DESC
            LIMIT 10
        `);

        const [mostViewed] = await db.execute(`
            SELECT c.ComicID, c.Title, c.CoverImageURL, c.Type, c.Status,
                   c.AverageRating, cv.TotalViews
            FROM Comic c
            JOIN ComicView cv ON c.ComicID = cv.ComicID
            ORDER BY cv.TotalViews DESC
            LIMIT 10
        `);

        res.json({ trending, mostViewed });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch home page data" });
    }
});

// Search with filters
router.get("/search", async (req, res) => {
    const { title, author, genre, type, status, language, year, minChapters, maxChapters } = req.query;

    try {
        let query = `
            SELECT DISTINCT c.ComicID, c.Title, c.CoverImageURL, c.Type,
                   c.Status, c.Language, c.ReleaseYear, c.AverageRating,
                   a.Name AS AuthorName
            FROM Comic c
            LEFT JOIN Author a ON c.AuthorID = a.AuthorID
            LEFT JOIN ComicGenre cg ON c.ComicID = cg.ComicID
            LEFT JOIN Genre g ON cg.GenreID = g.GenreID
            WHERE 1=1
        `;
        const params = [];

        if (title) {
            query += " AND c.Title LIKE ?";
            params.push(`%${title}%`);
        }
        if (author) {
            query += " AND a.Name LIKE ?";
            params.push(`%${author}%`);
        }
        if (genre) {
            query += " AND g.GenreName = ?";
            params.push(genre);
        }
        if (type) {
            query += " AND c.Type = ?";
            params.push(type);
        }
        if (status) {
            query += " AND c.Status = ?";
            params.push(status);
        }
        if (language) {
            query += " AND c.Language = ?";
            params.push(language);
        }
        if (year) {
            query += " AND c.ReleaseYear = ?";
            params.push(year);
        }
        if (minChapters) {
            query += " AND (SELECT COUNT(*) FROM Chapter WHERE Chapter.ComicID = c.ComicID) >= ?";
            params.push(parseInt(minChapters));
        }
        if (maxChapters) {
            query += " AND (SELECT COUNT(*) FROM Chapter WHERE Chapter.ComicID = c.ComicID) <= ?";
            params.push(parseInt(maxChapters));
        }

        query += " ORDER BY c.AverageRating DESC LIMIT 50";

        const [results] = await db.execute(query, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// Single comic detail
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Comic info
        const [comic] = await db.execute(`
            SELECT c.*, a.Name AS AuthorName
            FROM Comic c
            LEFT JOIN Author a ON c.AuthorID = a.AuthorID
            WHERE c.ComicID = ?
        `, [id]);

        if (comic.length === 0)
            return res.status(404).json({ error: "Comic not found" });

        // Genres
        const [genres] = await db.execute(`
            SELECT g.GenreName
            FROM Genre g
            JOIN ComicGenre cg ON g.GenreID = cg.GenreID
            WHERE cg.ComicID = ?
        `, [id]);

        // Chapters
        const [chapters] = await db.execute(`
            SELECT ChapterID, ChapterNumber, Title, UploadDate, PageCount
            FROM Chapter
            WHERE ComicID = ?
            ORDER BY ChapterNumber ASC
        `, [id]);

        // Reviews
        const [reviews] = await db.execute(`
            SELECT r.Rating, r.ReviewText, r.ReviewDate, u.Username
            FROM Review r
            JOIN User u ON r.UserID = u.UserID
            WHERE r.ComicID = ?
            ORDER BY r.ReviewDate DESC
            LIMIT 10
        `, [id]);

        // Increment total and weekly views
        await db.execute(`
            UPDATE ComicView
            SET TotalViews = TotalViews + 1, WeeklyViews = WeeklyViews + 1
            WHERE ComicID = ?
        `, [id]);

        res.json({
            ...comic[0],
            genres:   genres.map(g => g.GenreName),
            chapters,
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comic" });
    }
});

module.exports = router;