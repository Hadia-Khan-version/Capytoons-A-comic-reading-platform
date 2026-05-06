import os
from dotenv import load_dotenv
import random
import mysql.connector
from datetime import datetime, timedelta

load_dotenv("../.env") 

db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "3306")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME", "Capytoons") 

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

# ─────────────────────────────────────────────
#  DUMMY USERS
# ─────────────────────────────────────────────
DUMMY_USERS = [
    ("sakura_reads",   "sakura@capytoons.to"),
    ("manhwa_mike",    "mike@capytoons.to"),
    ("otaku_olivia",   "olivia@capytoons.to"),
    ("chapter_chase",  "chase@capytoons.to"),
    ("webtoon_wendy",  "wendy@capytoons.to"),
    ("manga_marcus",   "marcus@capytoons.to"),
    ("panel_priya",    "priya@capytoons.to"),
    ("inked_ivan",     "ivan@capytoons.to"),
    ("toon_talia",     "talia@capytoons.to"),
    ("scroll_sam",     "sam@capytoons.to"),
    ("binge_bella",    "bella@capytoons.to"),
    ("arc_ahmed",      "ahmed@capytoons.to"),
]

# Fake hashed password (in real app this would be bcrypt)
FAKE_HASH = "hashed_password_placeholder"

# ─────────────────────────────────────────────
#  REVIEW TEMPLATES
# ─────────────────────────────────────────────
POSITIVE_REVIEWS = [
    "Absolutely loved this one! The art style is stunning.",
    "One of the best I have read in a long time. Highly recommend!",
    "The character development is incredible. Can not stop reading.",
    "Amazing story with great pacing. Each chapter leaves you wanting more.",
    "The world-building here is on another level. Truly impressive.",
    "Cannot put this down. The plot twists are insane!",
    "Beautiful artwork and a compelling story. A must read.",
    "This exceeded all my expectations. Genuinely brilliant.",
    "The author knows how to keep readers hooked. Love it!",
    "Every chapter is better than the last. Addictive read.",
]

NEUTRAL_REVIEWS = [
    "Pretty decent read. Some chapters are slow but overall enjoyable.",
    "Good art but the story feels a bit generic at times.",
    "Interesting premise but execution could be better in some arcs.",
    "Not bad. Worth reading if you have the time.",
    "Started strong but felt a bit repetitive in the middle.",
    "Solid series overall. Nothing groundbreaking but entertaining.",
    "The art is great but the story takes a while to pick up.",
    "Enjoyable enough. I will keep reading to see where it goes.",
    "Has its moments. Fans of the genre will likely enjoy it.",
    "Decent series. The side characters could use more development.",
]

NEGATIVE_REVIEWS = [
    "Not really my type but I can see why others enjoy it.",
    "The pacing feels off and some plot points are confusing.",
    "Had higher expectations. The story did not deliver for me.",
    "Art is nice but the writing feels rushed in later chapters.",
    "Lost interest around the middle. Might not be for everyone.",
]

def random_review_text(rating):
    """Return review text that matches the rating tone."""
    if rating >= 4.0:
        return random.choice(POSITIVE_REVIEWS)
    elif rating >= 3.0:
        return random.choice(NEUTRAL_REVIEWS)
    else:
        return random.choice(NEGATIVE_REVIEWS)

def random_date():
    """Return a random datetime within the last 2 years."""
    days_ago = random.randint(1, 730)
    return datetime.now() - timedelta(days=days_ago)

# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────
def main():
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Connected to MySQL\n")

    # ── 1. Insert dummy users ─────────────────────────────────────────────────
    print("👤 Inserting dummy users...")
    user_ids = []
    for username, email in DUMMY_USERS:
        # Skip if already exists
        cursor.execute("SELECT UserID FROM User WHERE Email = %s", (email,))
        row = cursor.fetchone()
        if row:
            user_ids.append(row[0])
            print(f"   ⏭️  Skipping existing user: {username}")
            continue

        cursor.execute("""
            INSERT INTO User (Username, Email, PasswordHash, JoinDate)
            VALUES (%s, %s, %s, %s)
        """, (username, email, FAKE_HASH, random_date()))
        user_ids.append(cursor.lastrowid)
        print(f"   ✅ Created user: {username}")

    conn.commit()
    print(f"\n   Total users available: {len(user_ids)}\n")

    # ── 2. Fetch all comic IDs ────────────────────────────────────────────────
    cursor.execute("SELECT ComicID FROM Comic")
    comic_ids = [row[0] for row in cursor.fetchall()]
    print(f"📚 Found {len(comic_ids)} comics to review\n")

    # ── 3. Insert reviews ─────────────────────────────────────────────────────
    print("✍️  Inserting reviews...")
    total_reviews = 0

    for comic_id in comic_ids:
        # Pick 5-8 random users to review this comic (no duplicates per comic)
        reviewers = random.sample(user_ids, min(random.randint(5, 8), len(user_ids)))

        for user_id in reviewers:
            # Check if review already exists
            cursor.execute(
                "SELECT ReviewID FROM Review WHERE UserID = %s AND ComicID = %s",
                (user_id, comic_id)
            )
            if cursor.fetchone():
                continue

            # Generate a realistic rating (weighted toward higher ratings)
            rating = round(random.choices(
                [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
                weights=[2, 3, 8, 12, 20, 25, 30]
            )[0], 1)

            review_text = random_review_text(rating)
            review_date = random_date()

            cursor.execute("""
                INSERT INTO Review (UserID, ComicID, Rating, ReviewText, ReviewDate)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, comic_id, rating, review_text, review_date))
            total_reviews += 1

        conn.commit()

    print(f"   ✅ Inserted {total_reviews} reviews across {len(comic_ids)} comics\n")

    # ── 4. Update AverageRating for every comic ───────────────────────────────
    print("⭐ Updating AverageRating for all comics...")
    cursor.execute("""
        UPDATE Comic
        SET AverageRating = (
            SELECT ROUND(AVG(Rating), 1)
            FROM Review
            WHERE Review.ComicID = Comic.ComicID
        )
        WHERE EXISTS (
            SELECT 1 FROM Review WHERE Review.ComicID = Comic.ComicID
        )
    """)
    conn.commit()
    print("   ✅ AverageRating updated for all comics\n")

    # ── 5. Quick summary ──────────────────────────────────────────────────────
    cursor.execute("SELECT AVG(AverageRating) FROM Comic WHERE AverageRating IS NOT NULL")
    overall_avg = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Review")
    review_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM User")
    user_count = cursor.fetchone()[0]

    print("📊 Summary:")
    print(f"   Total users in DB  : {user_count}")
    print(f"   Total reviews in DB: {review_count}")
    print(f"   Overall avg rating : {round(overall_avg, 2) if overall_avg else 'N/A'}")

    cursor.close()
    conn.close()
    print("\n🎉 Done!")

if __name__ == "__main__":
    main()
