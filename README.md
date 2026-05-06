# CapyToons.to - Comic Reading Platform

## 📖 Project Overview
**CapyToons.to** is a web-based comic reading platform developed for the **Database Systems Lab**[cite: 1]. It serves as a centralized, reliable repository for manga, manhwa, manhua, and webtoons, aggregating content from diverse origins into a single interface[cite: 1]. 

The system addresses common issues in the comic-reading community, such as platform outages and poor metadata consistency, by providing a robust database-driven alternative[cite: 1].

## 🚀 Key Features
* **Advanced Search & Filter**: Discover titles by genre, type (manga/webtoon), status, language, year, and author[cite: 1].
* **Personalized Experience**: Registered users receive recommendations based on reading history, ratings, and bookmarks[cite: 1].
* **Reading History**: Automatically tracks the last-read chapter per comic for each user[cite: 1].
* **Community Interaction**: Integrated rating (1-5 stars) and text review system[cite: 1].
* **Admin Management**: Dedicated panel for managing comics and chapters[cite: 1].
* **Reporting**: Generates trending and popularity reports based on view counts[cite: 1].

## 🛠 Technology Stack
* **Frontend**: React.js, Tailwind CSS[cite: 1]
* **Backend**: Node.js, Express.js[cite: 1]
* **Database**: MySQL[cite: 1]
* **Scripts**: Python (utilizing MangaDex API for data seeding)[cite: 1, 2]

## 📊 Database Design
The core of CapyToons is a relational database designed to ensure data integrity and fast retrieval[cite: 1].

### Entity-Relationship Diagram (ERD)
The database structure utilizes Crow-Foot notations to represent relationships between entities[cite: 2].
![Entity Relationship Diagram](./images/CapytoonsERD.drawio.png)
* **Green Tables**: User-related data (History, Bookmarks, Reviews)[cite: 2].
* **Pink Tables**: Comic-related data (Authors, Genres, Chapters, Pages)[cite: 2].

> **Note:** For the full technical breakdown, refer to the following project files:
> * **[Comic_Reading_Platform.pdf](Comic_Reading_Platform.pdf)**
> * **[Project-Milestone1.docx](Project-Milestone1.docx)**

## 📂 Project Structure & Milestone 1
The current repository includes:
* **`Project-Milestone1.docx`**: Contains the full ERD and schema details[cite: 2].
* **`workflow.flowchart`**: Visual representation of the system logic.
![System Workflow](./images/Workflow.drawio.png)
* **Python Scripts**: Used to populate the database with ~50 comics and ~100 chapters via the MangaDex API[cite: 2].
* **Backend Routes**: Initial implementation of the API structure.

## 👥 Project Members
* **Hadia Khan**[cite: 1, 2]
* **Hamna Rehman**[cite: 1, 2]
* **Program**: BSSE-B (2024-28), IM Sciences[cite: 2]