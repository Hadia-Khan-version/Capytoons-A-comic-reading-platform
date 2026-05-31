# CapyToons — Comic Reading Platform

A full-stack manga, manhwa, and comic reading platform built for the **Database Systems Lab** at IM Sciences. CapyToons aggregates content from the MangaDex API into a local MySQL database and provides a modern, fast reading experience.

**Hadia Khan · Hamna Rehman**  
BSSE-B (2024–28), IM Sciences

---

## Features

- Browse 200+ manga and manhwa titles sourced from MangaDex
- Full-text search with autocomplete suggestions
- Filter by genre, type, status, language, and sort order
- Infinite scroll on browse page
- Chapter reader with vertical scroll, lazy-loaded images, and keyboard navigation
- Auto-saves reading progress — resume from where you left off
- Bookmark comics to a personal reading list
- Write and read reviews with star ratings
- JWT-based authentication (register, login, token refresh)
- User profile with bookmark count, history count, and review count
- Responsive design — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Animations | Framer Motion |
| State Management | Zustand (persisted to localStorage) |
| Backend | Node.js + Express |
| Database | MySQL |
| Authentication | JWT (access + refresh tokens) |
| Password Hashing | bcryptjs |
| Data Seeding | Python + MangaDex API |

---

## Project Structure

```
capytoons/
├── frontend/                  # React + Vite application
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── common/        # Navbar, Footer, SearchBar, Skeletons
│       │   ├── comic/         # ComicCard, ChapterList, ReviewSection
│       │   ├── home/          # HeroBanner, TrendingRow
│       │   ├── reader/        # ReaderImage, ReaderControls, ReaderSettings
│       │   └── browse/        # FilterSidebar
│       ├── pages/             # Route-level page components
│       │   ├── Home/
│       │   ├── Browse/
│       │   ├── Comic/
│       │   ├── Reader/
│       │   ├── Auth/
│       │   └── Profile/
│       ├── services/          # Axios API call functions (one per domain)
│       ├── store/             # Zustand auth store
│       ├── hooks/             # Custom hooks
│       └── routes/            # ProtectedRoute wrapper
│
├── backend/                   # Node.js + Express REST API
│   └── src/
│       ├── routes/            # Express routers
│       ├── controllers/       # Request/response handlers
│       ├── services/          # Business logic
│       ├── db/                # MySQL pool + query utilities
│       ├── middleware/        # Auth, validation
│       ├── utils/             # AppError, asyncHandler, response helpers
│       └── config/            # Environment variable loader
│
└── scripts/
    └── populate_capytoons.py  # MangaDex data seeding script
```

---

## Database Schema

12 tables organized around three domains:

**Content** — `Comic`, `Chapter`, `Page`, `Author`, `Genre`, `ComicGenre`  
**Users** — `User`  
**Interactions** — `Bookmark`, `ReadingHistory`, `Review`, `Comment`, `ComicView`

### Key design decisions

- `Bookmark` and `ReadingHistory` use composite primary keys `(UserID, ComicID)` — enforces one entry per user per comic
- Reading progress uses `INSERT ... ON DUPLICATE KEY UPDATE` — single query handles both first-time save and updates
- `AverageRating` is stored on `Comic` and recalculated inside a transaction on every review change — keeps reads fast
- `ComicView` is a separate table — prevents row-level locking on the main Comic table during view increments
- `MangaDexChapterID` stored on `Chapter` — page image URLs fetched fresh from MangaDex on every read instead of storing expiring URLs

---

## API Endpoints

```
AUTH
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  GET    /api/auth/me                    🔒

COMICS
  GET    /api/comics
  GET    /api/comics/trending
  GET    /api/comics/most-viewed
  GET    /api/comics/recent
  GET    /api/comics/genres
  GET    /api/comics/genres/:genreId
  GET    /api/comics/search
  GET    /api/comics/:id

CHAPTERS
  GET    /api/chapters/:comicId
  GET    /api/chapters/:comicId/:chapterId/pages

BOOKMARKS                                🔒 all
  GET    /api/bookmarks
  POST   /api/bookmarks
  POST   /api/bookmarks/toggle
  DELETE /api/bookmarks/:comicId

HISTORY                                  🔒 all
  GET    /api/history
  POST   /api/history
  DELETE /api/history/all
  DELETE /api/history/:comicId

REVIEWS
  GET    /api/reviews/my/count           🔒
  GET    /api/reviews/:comicId
  POST   /api/reviews/:comicId           🔒
  PUT    /api/reviews/:reviewId          🔒
  DELETE /api/reviews/:reviewId          🔒

SEARCH
  GET    /api/search/suggestions
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Python 3.10+

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Python script dependencies
pip install mysql-connector-python requests python-dotenv
```

### 2. Create the database

```sql
CREATE DATABASE capytoons CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema SQL to create all 12 tables.

### 3. Configure environment variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=capytoons

JWT_SECRET=your_64_char_random_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_other_64_char_secret
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_ROUNDS=12
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
```

Generate secure JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Populate the database

```bash
cd scripts
py populate_capytoons.py
```

This fetches 100 manga (Japanese) + 100 manhwa (Korean) from MangaDex — including metadata, cover images, genres, authors, and chapters. Takes about 3–5 minutes due to API rate limiting.

### 5. Start the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# API running at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## How MangaDex Integration Works

Cover images (`uploads.mangadex.org`) are stable CDN URLs stored directly in the database and loaded by the browser.

Chapter page images use MangaDex's **at-home server** system — URLs contain session hashes that expire. Rather than storing these, the backend fetches fresh URLs on demand:

```
User opens chapter
       ↓
Backend reads MangaDexChapterID from Chapter table
       ↓
GET https://api.mangadex.org/at-home/server/{uuid}
       ↓
MangaDex returns: baseUrl + hash + filenames
       ↓
Backend builds: {baseUrl}/data/{hash}/{filename}
       ↓
Fresh URLs returned to frontend (cached 15 min)
       ↓
Browser loads images directly from MangaDex CDN
```

---

## ERD & Workflow

![ERD](./images/CapytoonsERD.drawio.png)

![Workflow](./images/Workflow.drawio.png)

---

## Project Members

| Name | Role |
|---|---|
| Hadia Khan | Full-stack development, database design, API integration |
| Hamna Rehman | Full-stack development, database design, Python scripting |

**Program:** BSSE-B (2024–28), IM Sciences  
**Course:** Database Systems Lab
