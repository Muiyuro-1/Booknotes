# 📖 BookNotes

A personal books and movies review journal built with Node.js, Express, EJS, and PostgreSQL.

## Features

- ✅ Add, edit, delete reviews for books and movies
- ✅ Rate each entry from 1–10
- ✅ Write full reviews + personal notes
- ✅ Filter by type (book/movie) and search by title, author, genre
- ✅ Sort by newest, highest rated, or alphabetically
- ✅ Dashboard stats (total reviews, avg rating)
- ✅ Responsive design

## Tech Stack

- **Backend**: Node.js + Express
- **Templating**: EJS
- **Database**: PostgreSQL (via `pg`)
- **Other**: method-override (PUT/DELETE forms), dotenv

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up PostgreSQL
Make sure PostgreSQL is running, then:
```bash
psql -U postgres -f db/schema.sql
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 4. Run the app
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
booknotes/
├── app.js                  # Express app entry point
├── db/
│   ├── pool.js             # PostgreSQL connection
│   └── schema.sql          # Database schema + sample data
├── routes/
│   ├── home.js             # GET / (index with filters)
│   └── reviews.js          # CRUD routes for reviews
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs           # Home / listing page
│   ├── detail.ejs          # Single review page
│   ├── form.ejs            # Create / edit form
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   ├── css/style.css
│   └── js/main.js
├── .env.example
└── package.json
```

## Database Schema

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) CHECK (type IN ('book', 'movie')),
  title VARCHAR(255) NOT NULL,
  author_director VARCHAR(255),
  cover_url TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  review TEXT,
  notes TEXT,
  genre VARCHAR(100),
  year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## v2 Features

### 🔐 User Authentication
- Register / Login / Logout (Passport.js + bcrypt)
- Session stored in PostgreSQL (`connect-pg-simple`)
- Each user sees only their own reviews

### 📊 Dashboard (`/stats`)
- Overview cards: books, movies, favorites, want-to-read count
- Rating distribution bar chart (1–10)
- Top genres with bar chart + avg rating
- Activity timeline (last 12 months)
- Top rated entries (9–10) with cover art
- Recently added list

### 🌙 Dark Mode
- Toggle in navbar, persisted to `localStorage`

### 🖼️ Auto Cover Art Fetch
- Books: Open Library API (free, no key required)
- Movies: OMDB API (free key at [omdbapi.com](https://omdbapi.com))
- Set `OMDB_API_KEY` in `.env` to enable movie covers
- Live cover preview when typing a URL manually

### ⚡ Other
- Flash messages (success/error, auto-dismiss after 4s)
- User dropdown menu with avatar initial + color
- Status tracking: Completed / In Progress / Want To
- ⭐ Favorite toggle (AJAX, no page reload)
- Status filter on home page
