import os
import time
import requests
from dotenv import load_dotenv
import mysql.connector

load_dotenv("dotenv") 

db_host     = "localhost"
db_port     = 3306
db_user     = "root"
db_password = "12345678"
db_name     = "Capytoons"

# ─────────────────────────────────────────────
#  DATABASE CONFIG 
# ─────────────────────────────────────────────

DB_CONFIG = {
    "host":     db_host,
    "port":     db_port,
    "user":     db_user,
    "password": db_password,   
    "database": db_name
}

BASE_URL   = "https://api.mangadex.org"
LANGUAGE   = "en"
TOTAL_COMICS = 100

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def get(endpoint, params=None):
    """GET request with a small delay to respect rate limits."""
    time.sleep(1.0)
    r = requests.get(f"{BASE_URL}{endpoint}", params=params, timeout=15)
    r.raise_for_status()
    return r.json()


def get_relationship(relationships, rel_type):
    """Pull the first relationship of a given type from a MangaDex object."""
    for rel in relationships:
        if rel["type"] == rel_type:
            return rel
    return None


def get_localized(obj, key="en"):
    """Return English value from a localized dict, falling back to first available."""
    if not obj:
        return None
    return obj.get(key) or next(iter(obj.values()), None)


# ─────────────────────────────────────────────
#  GENRE CACHE  (insert once, reuse ID)
# ─────────────────────────────────────────────
genre_cache = {}   # GenreName -> GenreID

def get_or_create_genre(cursor, name):
    if name in genre_cache:
        return genre_cache[name]
    cursor.execute("SELECT GenreID FROM Genre WHERE GenreName = %s", (name,))
    row = cursor.fetchone()
    if row:
        genre_cache[name] = row[0]
        return row[0]
    cursor.execute("INSERT INTO Genre (GenreName) VALUES (%s)", (name,))
    genre_cache[name] = cursor.lastrowid
    return cursor.lastrowid


# ─────────────────────────────────────────────
#  AUTHOR CACHE
# ─────────────────────────────────────────────
author_cache = {}  # MangaDex author UUID -> AuthorID

def get_or_create_author(cursor, author_rel):
    if author_rel is None:
        return None
    uid = author_rel["id"]
    if uid in author_cache:
        return author_cache[uid]

    # Author name lives in attributes if included
    name = None
    nationality = None
    attrs = author_rel.get("attributes") or {}
    name = attrs.get("name")

    if not name:
        name = "Unknown"

    cursor.execute("SELECT AuthorID FROM Author WHERE Name = %s", (name,))
    row = cursor.fetchone()
    if row:
        author_cache[uid] = row[0]
        return row[0]

    cursor.execute(
        "INSERT INTO Author (Name, Nationality) VALUES (%s, %s)",
        (name, nationality)
    )
    author_cache[uid] = cursor.lastrowid
    return cursor.lastrowid


# ─────────────────────────────────────────────
#  MAP MangaDex publicationDemographic / tags -> Type
# ─────────────────────────────────────────────
def get_comic_type(manga_attrs):
    """
    MangaDex doesn't have an explicit manga/manhwa/manhua field but
    'originalLanguage' is a reliable indicator.
    """
    lang = manga_attrs.get("originalLanguage", "")
    if lang == "ko":
        return "Manhwa"
    elif lang == "zh" or lang == "zh-hk":
        return "Manhua"
    elif lang == "ja":
        return "Manga"
    else:
        return "Webtoon"


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────
def main():
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Connected to MySQL\n")

    # ── 1. Fetch 50 manga from MangaDex ──────────────────────────────────────
    print(f"📡 Fetching {TOTAL_COMICS} comics from MangaDex...")
    print(f"📡 Fetching {TOTAL_COMICS} manga from MangaDex...")
    manga_params = {
        "limit":                          TOTAL_COMICS,
        "offset":                         0,
        "contentRating[]":                ["safe", "suggestive"],
        "includes[]":                     ["author", "cover_art"],
        "order[followedCount]":           "desc",
        "availableTranslatedLanguage[]":  LANGUAGE,
        "originalLanguage[]":             "ja",       # Japanese only
    }
    manga_data  = get("/manga", manga_params)
    mangas      = manga_data.get("data", [])
    print(f"   Got {len(mangas)} manga.\n")

    print(f"📡 Fetching {TOTAL_COMICS} manhwa from MangaDex...")
    manhwa_params = {
        "limit":                          TOTAL_COMICS,
        "offset":                         0,
        "contentRating[]":                ["safe", "suggestive"],
        "includes[]":                     ["author", "cover_art"],
        "order[followedCount]":           "desc",
        "availableTranslatedLanguage[]":  LANGUAGE,
        "originalLanguage[]":             "ko",       # Korean only
    }
    manhwa_data = get("/manga", manhwa_params)
    manhwas     = manhwa_data.get("data", [])
    print(f"   Got {len(manhwas)} manhwa.\n")

    # Combine both lists
    mangas = mangas + manhwas
    print(f"📚 Total comics to insert: {len(mangas)}\n")
    print(f"   Got {len(mangas)} comics.\n")

    for idx, manga in enumerate(mangas, 1):
        attrs         = manga["attributes"]
        manga_id      = manga["id"]
        relationships = manga.get("relationships", [])

        # ── Basic metadata ────────────────────────────────────────────────────
        title       = get_localized(attrs.get("title"))
        description = get_localized(attrs.get("description"))
        status      = attrs.get("status", "unknown").capitalize()
        year        = attrs.get("year")
        language    = attrs.get("originalLanguage", "unknown")
        comic_type  = get_comic_type(attrs)

        # ── Cover image URL ───────────────────────────────────────────────────
        cover_rel   = get_relationship(relationships, "cover_art")
        cover_url   = None
        if cover_rel and cover_rel.get("attributes"):
            fname     = cover_rel["attributes"].get("fileName")
            cover_url = f"https://uploads.mangadex.org/covers/{manga_id}/{fname}" if fname else None

        # ── Author ────────────────────────────────────────────────────────────
        author_rel  = get_relationship(relationships, "author")
        author_id   = get_or_create_author(cursor, author_rel)

        # ── Insert Comic ──────────────────────────────────────────────────────
        cursor.execute("SELECT ComicID FROM Comic WHERE Title = %s", (title,))
        existing = cursor.fetchone()
        if existing:
            print(f"   [{idx:02}/{TOTAL_COMICS}] ⏭️  Skipping (already exists): {title}")
            continue
        cursor.execute("""
            INSERT INTO Comic (Title, CoverImageURL, Description, ReleaseYear, Status, Type, Language, AuthorID)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (title, cover_url, description, year, status, comic_type, language, author_id))
        comic_id = cursor.lastrowid
        conn.commit()

        # ── ComicView row ─────────────────────────────────────────────────────
        cursor.execute(
            "INSERT INTO ComicView (ComicID, TotalViews, WeeklyViews) VALUES (%s, 0, 0)",
            (comic_id,)
        )

        # ── Genres ────────────────────────────────────────────────────────────
        tags = attrs.get("tags", [])
        for tag in tags:
            tag_attrs = tag.get("attributes", {})
            genre_name = get_localized(tag_attrs.get("name"))
            if genre_name:
                genre_id = get_or_create_genre(cursor, genre_name)
                try:
                    cursor.execute(
                        "INSERT INTO ComicGenre (ComicID, GenreID) VALUES (%s, %s)",
                        (comic_id, genre_id)
                    )
                except mysql.connector.errors.IntegrityError:
                    pass  # duplicate, skip

        conn.commit()
        print(f"   [{idx:02}/{TOTAL_COMICS}] ✅ Comic inserted: {title} ({comic_type})")

        # ── 2. Fetch English chapters for this comic ──────────────────────────
        chapter_params = {
            "translatedLanguage[]": LANGUAGE,
            "limit":                96,           # up to 50 chapters per comic
            "order[chapter]":       "asc",
            "contentRating[]":      ["safe", "suggestive"],
        }
        try:
            ch_data  = get(f"/manga/{manga_id}/feed", chapter_params)
        except Exception as e:
            print(f"      ⚠️  Could not fetch chapters: {e}")
            continue

        chapters = ch_data.get("data", [])
        print(f"      📖 {len(chapters)} chapters found")

        for chapter in chapters:
            ch_attrs    = chapter["attributes"]
            chapter_uid = chapter["id"]

            ch_number_raw = ch_attrs.get("chapter")
            try:
                ch_number = float(ch_number_raw) if ch_number_raw else 0
            except ValueError:
                ch_number = 0

            ch_title    = ch_attrs.get("title") or f"Chapter {ch_number}"
            ch_pages    = ch_attrs.get("pages", 0)
            ch_date     = ch_attrs.get("publishAt", None)
            if ch_date:
                ch_date = ch_date[:19].replace("T", " ")   # MySQL DATETIME format

            cursor.execute("""
                INSERT INTO Chapter (ComicID, ChapterNumber, Title, UploadDate, PageCount, MangaDexChapterID)
                VALUES (%s, %s, %s, %s, %s, %s)
                """, (comic_id, ch_number, ch_title, ch_date, ch_pages, chapter_uid))
            conn.commit()

        print(f"      ✅ Chapters + pages inserted for: {title}\n")

    # ── Done ──────────────────────────────────────────────────────────────────
    cursor.close()
    conn.close()
    print("🎉 Done! Database populated successfully.")


if __name__ == "__main__":
    main()