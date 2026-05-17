# Dataflow Description — Capytoons Comic Reading Platform

## Overview

The Capytoons platform uses a hybrid data pipeline consisting of real-world data fetched from the MangaDex API and synthetic user interaction data generated through Python scripts. The system follows an ETL (Extract, Transform, Load) architecture where raw data is processed, normalized, and stored in a relational MySQL database, then exported for downstream use.

---

## 1. Data Ingestion Layer

Data enters the system from two sources:

### 1.1 External API (Content Data)
- Source: MangaDex API
- Data type: JSON
- Retrieved information includes:
  - Manga metadata (title, description, status, language)
  - Authors
  - Genres/tags
  - Chapters
  - Page image URLs

This data is fetched using Python requests and rate-limited to comply with API constraints.

### 1.2 Synthetic Data Generation (User Data)
- Generated using Python scripts
- Includes:
  - User profiles (username, email, join date)
  - Reviews and ratings
  - Review timestamps
- Designed to simulate realistic user engagement patterns on the platform

---

## 2. Data Processing and Transformation Layer

After ingestion, raw data undergoes preprocessing before being inserted into the database.

### 2.1 Data Cleaning
- Removal of duplicate comic entries using title-based checks
- Handling missing values in optional fields (e.g., descriptions, author names)
- Standardization of text encoding (UTF-8)
- Conversion of timestamps into MySQL-compatible DATETIME format

### 2.2 JSON Normalization
Nested API responses are decomposed into relational structures:
- Manga → Comic table
- Authors → Author table
- Genres → Genre table
- Chapters → Chapter table
- Pages → Page table

### 2.3 Relationship Mapping
Many-to-many relationships are handled using junction tables:
- ComicGenre (Comic ↔ Genre)

---

## 3. Database Loading Layer

Cleaned and transformed data is inserted into a MySQL relational database using Python (mysql.connector).

### Key Operations:
- Insert-or-skip logic to prevent duplicate records
- Foreign key mapping for relational integrity
- Batch insertion for efficiency (e.g., page data)
- In-memory caching for authors and genres to reduce redundant queries

---

## 4. User Interaction Layer (Synthetic Behavior Data)

After core content insertion, user engagement data is generated:

### 4.1 Reviews and Ratings
- Each comic receives multiple reviews from randomly selected users
- Ratings are generated using a weighted probability distribution favoring higher ratings
- Review text is aligned with rating sentiment:
  - Positive reviews for high ratings
  - Neutral reviews for mid ratings
  - Negative reviews for low ratings

### 4.2 Data Integrity Rules
- Each user can only review a comic once
- Duplicate reviews are prevented using pre-insertion checks

---

## 5. Aggregation and Analytics Layer

Once reviews are inserted, analytical processing is performed:

### Average Rating Calculation
- The average rating for each comic is computed using SQL aggregation:
  - `AVG(Rating)` grouped by ComicID
- The result is stored in the Comic table as `AverageRating`

This ensures that each comic reflects real-time user feedback.

---

## 6. Output Layer

The final processed data is made available through:

### 6.1 Database Queries
- Comic browsing
- Chapter reading
- Genre filtering
- Review display
- Rating-based sorting

### 6.2 CSV Export
All core database tables are exported as CSV files for:
- Milestone submission
- Backup and portability
- Future database re-import (Milestone 5 requirement)

---

## 7. End-to-End Data Pipeline