import express from 'express';
import methodOverride from 'method-override';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import flash from 'connect-flash';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import pool from './db/pool.js';
import passport from './db/passport.js';

import homeRouter    from './routes/home.js';
import reviewsRouter from './routes/reviews.js';
import authRouter    from './routes/auth.js';
import statsRouter   from './routes/stats.js';
import apiRouter     from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── View engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// ── Session store
const PgStore = connectPgSimple(session);
app.use(session({
  store: new PgStore({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'booknotes-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 }
}));

// ── Passport
app.use(passport.initialize());
app.use(passport.session());

// ── Flash
app.use(flash());

// ── Static + body
app.use(express.static(join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// ── Locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.flash = {
    success: req.flash('success'),
    error:   req.flash('error')
  };
  next();
});

// ── Routes
app.use('/',        homeRouter);
app.use('/reviews', reviewsRouter);
app.use('/auth',    authRouter);
app.use('/stats',   statsRouter);
app.use('/api',     apiRouter);

// ── 404
app.use((req, res) => {
  res.status(404).render('404', { title: '404 — Not Found' });
});

// ── Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n📚  BookNotes v2 → http://localhost:${PORT}`);
  console.log(`    Demo: demo@booknotes.app / password\n`);
});
