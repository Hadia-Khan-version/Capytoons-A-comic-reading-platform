# CapyToons — Milestone 2: Schema Normalization (1NF → 3NF)

**Project:** CapyToons Comic Reading Platform  
**Team:** Hadia Khan, Hamna Rehman — BSSE-B (2024–28), IM Sciences  
**Milestone:** 2 — Normalize schema, document justification, update ERD

---

## 1. What Changed in Milestone 2

| Change | Details |
|--------|---------|
| ✅ Analyzed | All 12 tables verified for 1NF, 2NF, and 3NF compliance |
| ✅ Justified | Two intentional denormalizations documented |
| ✅ Updated | ERD with Comment table and color-coded legend |

---

## 3. Normalization Analysis

> **Quick Reference:**
> - **1NF** = Atomic values, no repeating groups, has a Primary Key
> - **2NF** = 1NF + No partial dependencies (every non-key column depends on the *whole* PK)
> - **3NF** = 2NF + No transitive dependencies (no non-key column depends on another non-key column)

---

### Table 1: User

| Column | Type | Notes |
|--------|------|-------|
| UserID | INT AI | PK |
| Username | VARCHAR(50) | UNIQUE |
| Email | VARCHAR(100) | UNIQUE |
| PasswordHash | VARCHAR(255) | Hashed via bcrypt |

**1NF ✅** — All values atomic, PK defined.  
**2NF ✅** — Single-column PK; no partial dependencies possible.  
**3NF ✅** — Username and Email are independent facts about the user. PasswordHash only describes UserID. No transitive dependencies.

---

### Table 2: Author

| Column | Type | Notes |
|--------|------|-------|
| AuthorID | INT AI | PK |
| Name | VARCHAR(100) | |

**1NF ✅** — Atomic, has PK.  
**2NF ✅** — Single-column PK.  
**3NF ✅** — Name is a direct fact about AuthorID. No transitive dependencies.

**Justification for separating Author from Comic:** A single author can publish multiple comics. Embedding author name directly in Comic would violate 2NF (author data would be duplicated per comic) and create update anomalies.

---

### Table 3: Comic

| Column | Type | Notes |
|--------|------|-------|
| ComicID | INT AI | PK |
| AuthorID | INT | FK → Author |
| Title | VARCHAR(255) | |
| CoverImageURL | TEXT | |
| Type | ENUM | manga/manhwa/manhua/webtoon |
| Status | ENUM | ongoing/completed/hiatus |
| Language | VARCHAR(30) | |
| ReleaseYear | YEAR | |
| AverageRating | DECIMAL(3,1) | ⚠️ Denormalized (see note) |

**1NF ✅** — Atomic values, PK defined.  
**2NF ✅** — Single-column PK.  
**3NF ⚠️ (Intentional Denormalization)** — `AverageRating` is technically derivable from the `Review` table (`SELECT AVG(Rating) FROM Review WHERE ComicID = ?`). Storing it here violates strict 3NF.

**Justification:** AverageRating is queried on *every* comic listing, search result, and home page load. Recalculating it live via aggregation on every request would be expensive at scale. It is maintained by a trigger-style UPDATE in the `reviews.js` route after every new review submission. This is a deliberate performance-first denormalization, a common and accepted practice documented explicitly here.

---

### Table 4: Genre

| Column | Type | Notes |
|--------|------|-------|
| GenreID | INT AI | PK |
| GenreName | VARCHAR(50) | UNIQUE |

**1NF ✅ | 2NF ✅ | 3NF ✅**  
A minimal lookup table. GenreName is a direct atomic fact about GenreID.

---

### Table 5: ComicGenre *(Junction Table)*

| Column | Type | Notes |
|--------|------|-------|
| ComicID | INT | PK (composite), FK → Comic |
| GenreID | INT | PK (composite), FK → Genre |

**1NF ✅** — No repeating groups. A comic's genres that previously might have been stored as a comma-separated list (`"Action, Romance, Fantasy"`) are now properly decomposed into atomic rows.

**2NF ✅** — The composite PK is (ComicID, GenreID). There are no other columns, so there are no partial dependencies to worry about.

**3NF ✅** — No non-key columns; nothing to transitively depend on anything.

**Justification:** Comics have a Many-to-Many relationship with Genres. This junction table correctly resolves that M:N into two 1:N relationships, which is the standard relational approach.

---

### Table 6: Chapter

| Column | Type | Notes |
|--------|------|-------|
| ChapterID | INT AI | PK |
| ComicID | INT | FK → Comic |
| ChapterNumber | INT | |
| Title | VARCHAR(255) | |
| UploadDate | DATE | |
| PageCount | INT | ⚠️ Denormalized (see note) |

**1NF ✅ | 2NF ✅**  
**3NF ⚠️ (Intentional Denormalization)** — `PageCount` can be derived from `SELECT COUNT(*) FROM Page WHERE ChapterID = ?`.

**Justification:** PageCount is displayed alongside every chapter listing so readers know how long a chapter is before clicking into it. Counting pages on every chapter list render is unnecessary overhead. PageCount is set once at upload time and rarely changes, making it safe to store directly. Documented as an intentional denormalization for read performance.

---

### Table 7: Page

| Column | Type | Notes |
|--------|------|-------|
| PageID | INT AI | PK |
| ChapterID | INT | FK → Chapter |
| PageNumber | INT | |
| ImageURL | TEXT | |

**1NF ✅ | 2NF ✅ | 3NF ✅**  
All columns are direct facts about PageID. ChapterID is a FK reference, not a transitive dependency.

---

### Table 8: Review

| Column | Type | Notes |
|--------|------|-------|
| ReviewID | INT AI | PK |
| UserID | INT | FK → User |
| ComicID | INT | FK → Comic |
| Rating | TINYINT | 1–5 |
| ReviewText | TEXT | |
| ReviewDate | TIMESTAMP | |
| *(constraint)* | | UNIQUE(UserID, ComicID) |

**1NF ✅** — All values atomic.  
**2NF ✅** — Although the natural key is (UserID, ComicID), a surrogate PK (ReviewID) is used. Rating, ReviewText, and ReviewDate all describe a specific review — they depend on the full natural key.  
**3NF ✅** — No non-key column depends on another non-key column. ReviewDate does not depend on Rating, etc.

---

### Table 9: Bookmark

| Column | Type | Notes |
|--------|------|-------|
| BookmarkID | INT AI | PK |
| UserID | INT | FK → User |
| ComicID | INT | FK → Comic |
| ListType | ENUM | reading/completed/plan_to_read/dropped |
| *(constraint)* | | UNIQUE(UserID, ComicID) |

**1NF ✅ | 2NF ✅ | 3NF ✅**  
ListType is a direct attribute of the (User, Comic) bookmark relationship. No transitive dependencies.

---

### Table 10: ReadingHistory

| Column | Type | Notes |
|--------|------|-------|
| HistoryID | INT AI | PK |
| UserID | INT | FK → User |
| ComicID | INT | FK → Comic |
| LastChapterID | INT | FK → Chapter |
| LastReadAt | TIMESTAMP | |
| *(constraint)* | | UNIQUE(UserID, ComicID) |

**1NF ✅ | 2NF ✅ | 3NF ✅**  
LastChapterID and LastReadAt describe the reading progress of a specific user for a specific comic. LastChapterID is a FK reference, not a transitive dependency on chapter data.

---

### Table 11: ComicView

| Column | Type | Notes |
|--------|------|-------|
| ComicID | INT | PK + FK → Comic |
| TotalViews | INT | |
| WeeklyViews | INT | |

**1NF ✅ | 2NF ✅ | 3NF ✅**  
TotalViews and WeeklyViews are direct metrics for a comic. Separated from the Comic table to keep the main entity table clean and allow independent indexing of view statistics.

---

### Table 12: Comment *(NEW)*

| Column | Type | Notes |
|--------|------|-------|
| CommentID | INT AI | PK |
| UserID | INT | FK → User (NOT NULL) |
| ComicID | INT | FK → Comic (NOT NULL) |
| CommentText | VARCHAR(1000) | |
| CreatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**1NF ✅** — CommentText is a single atomic text value. CreatedAt is a single timestamp.  
**2NF ✅** — Single-column PK (CommentID). All columns depend on CommentID directly.  
**3NF ✅** — CommentText describes the comment content. CreatedAt describes when it was created. Neither depends on the other. UserID and ComicID are FK references, not transitive paths.

**Key design decision:** Unlike Review, Comment has NO UNIQUE(UserID, ComicID) constraint. A user may post multiple comments on the same comic (discussion thread behavior). This is the correct semantic distinction from the Review table.

---
