USE Capytoons;

SET SQL_SAFE_UPDATES = 0;

-- update query on user table
UPDATE User
SET Username = 'kewlgirl'
WHERE UserID = 1;

-- delete query on user table
DELETE FROM User
WHERE Email LIKE '%test%';

-- count rows in each tables
SELECT 'Comic' AS TableName, COUNT(*) FROM Comic
UNION
SELECT 'Author', COUNT(*) FROM Author
UNION
SELECT 'Genre', COUNT(*) FROM Genre
UNION
SELECT 'Chapter', COUNT(*) FROM Chapter
UNION
SELECT 'Page', COUNT(*) FROM Page
UNION
SELECT 'User', COUNT(*) FROM User
UNION
SELECT 'Review', COUNT(*) FROM Review
UNION
SELECT 'readinghistory', COUNT(*) FROM readinghistory
UNION
SELECT 'comment', COUNT(*) FROM comment
UNION
SELECT 'comicview', COUNT(*) FROM comicview
UNION
SELECT 'bookmark', COUNT(*) FROM bookmark
UNION
SELECT 'ComicGenre', COUNT(*) FROM ComicGenre;

-- null counts of key attributes
SELECT 'Comic' AS TableName, 'ComicID' AS ColumnName,
       SUM(CASE WHEN ComicID IS NULL THEN 1 ELSE 0 END) AS NullCount
FROM Comic

UNION ALL

SELECT 'Comic', 'Title',
       SUM(CASE WHEN Title IS NULL THEN 1 ELSE 0 END)
FROM Comic

UNION ALL

SELECT 'Comic', 'AuthorID',
       SUM(CASE WHEN AuthorID IS NULL THEN 1 ELSE 0 END)
FROM Comic

UNION ALL

SELECT 'Chapter', 'ChapterID',
       SUM(CASE WHEN ChapterID IS NULL THEN 1 ELSE 0 END)
FROM Chapter

UNION ALL

SELECT 'Chapter', 'ComicID',
       SUM(CASE WHEN ComicID IS NULL THEN 1 ELSE 0 END)
FROM Chapter

UNION ALL

SELECT 'Chapter', 'ChapterNumber',
       SUM(CASE WHEN ChapterNumber IS NULL THEN 1 ELSE 0 END)
FROM Chapter

UNION ALL

SELECT 'Page', 'ChapterID',
       SUM(CASE WHEN ChapterID IS NULL THEN 1 ELSE 0 END)
FROM Page

UNION ALL

SELECT 'Page', 'ImageURL',
       SUM(CASE WHEN ImageURL IS NULL THEN 1 ELSE 0 END)
FROM Page

UNION ALL

SELECT 'User', 'UserID',
       SUM(CASE WHEN UserID IS NULL THEN 1 ELSE 0 END)
FROM User

UNION ALL

SELECT 'User', 'Email',
       SUM(CASE WHEN Email IS NULL THEN 1 ELSE 0 END)
FROM User

UNION ALL

SELECT 'Review', 'ReviewID',
       SUM(CASE WHEN ReviewID IS NULL THEN 1 ELSE 0 END)
FROM Review

UNION ALL

SELECT 'Review', 'UserID',
       SUM(CASE WHEN UserID IS NULL THEN 1 ELSE 0 END)
FROM Review

UNION ALL

SELECT 'Review', 'ComicID',
       SUM(CASE WHEN ComicID IS NULL THEN 1 ELSE 0 END)
FROM Review

UNION ALL

SELECT 'Review', 'Rating',
       SUM(CASE WHEN Rating IS NULL THEN 1 ELSE 0 END)
FROM Review;

-- join checks for FK integrity
SELECT c.ComicID, c.Title, a.AuthorID, a.Name
FROM Comic c
INNER JOIN Author a ON c.AuthorID = a.AuthorID;

SELECT ch.ChapterID, ch.ChapterNumber, c.Title
FROM Chapter ch
INNER JOIN Comic c ON ch.ComicID = c.ComicID;

SELECT r.ReviewID, u.Username, c.Title, r.Rating
FROM Review r
INNER JOIN User u ON r.UserID = u.UserID
INNER JOIN Comic c ON r.ComicID = c.ComicID;

SELECT c.Title, g.GenreName
FROM ComicGenre cg
INNER JOIN Comic c ON cg.ComicID = c.ComicID
INNER JOIN Genre g ON cg.GenreID = g.GenreID;