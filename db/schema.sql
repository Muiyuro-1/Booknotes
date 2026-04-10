-- BookNotes v2 Database Schema
-- Run: psql -U postgres -f db/schema.sql

CREATE DATABASE booknotes;
\c booknotes;

-- Sessions table (connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
  sid   VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess  JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_color  VARCHAR(20)  DEFAULT '#38bdf8',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(10) NOT NULL CHECK (type IN ('book', 'movie')),
  title           VARCHAR(255) NOT NULL,
  author_director VARCHAR(255),
  cover_url       TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 10),
  review          TEXT,
  notes           TEXT,
  genre           VARCHAR(100),
  year            INTEGER,
  status          VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed','in_progress','want_to')),
  favorite        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo user (password: demo1234)
INSERT INTO users (username, email, password_hash, avatar_color) VALUES
('demo', 'demo@booknotes.app', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '#38bdf8')
ON CONFLICT DO NOTHING;

-- Sample reviews for demo user
INSERT INTO reviews (user_id, type, title, author_director, rating, review, notes, genre, year, favorite) VALUES
(1, 'book', 'The Alchemist', 'Paulo Coelho', 9, 'A timeless tale about following your dreams and listening to the universe.', 'Re-read annually. The concept of Personal Legend is life-changing.', 'Fiction', 1988, true),
(1, 'book', 'Atomic Habits', 'James Clear', 10, 'Practical, science-backed guide to building good habits. Changed how I approach personal development entirely.', '1% better every day. Focus on systems not goals.', 'Self-Help', 2018, true),
(1, 'book', 'Sapiens', 'Yuval Noah Harari', 9, 'A sweeping history of humankind that will make you question everything. Jaw-dropping in scope.', 'The chapter on money is worth the whole book.', 'History', 2011, false),
(1, 'movie', 'Inception', 'Christopher Nolan', 10, 'Mind-bending masterpiece that rewards multiple viewings. The sound design and cinematography are unmatched.', 'Watch it with full attention. The ending is intentionally ambiguous.', 'Sci-Fi', 2010, true),
(1, 'movie', 'Everything Everywhere All at Once', 'Daniel Kwan & Daniel Scheinert', 9, 'Wildly creative multiverse story about love, family and finding meaning in chaos.', 'Give it 20 minutes before judging. It earns every tear.', 'Drama', 2022, true),
(1, 'movie', 'Parasite', 'Bong Joon-ho', 10, 'A perfect film. Social satire disguised as a thriller — shocking, funny, heartbreaking all at once.', 'Watch knowing as little as possible.', 'Thriller', 2019, false)
ON CONFLICT DO NOTHING;

