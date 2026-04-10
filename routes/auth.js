import express from 'express';
import bcrypt from 'bcrypt';
import passport from '../db/passport.js';
import pool from '../db/pool.js';
import { redirectIfAuth } from '../db/middleware.js';

const router = express.Router();

// GET login
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('auth/login', {
    title: 'Sign In — BookNotes',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST login
router.post('/login', redirectIfAuth,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

// GET register
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('auth/register', {
    title: 'Create Account — BookNotes',
    error: req.flash('error')
  });
});

// POST register
router.post('/register', redirectIfAuth, async (req, res) => {
  const { username, email, password, confirm } = req.body;
  try {
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }
    if (password !== confirm) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register');
    }

    const existing = await pool.query('SELECT id FROM users WHERE email=$1 OR username=$2', [email, username]);
    if (existing.rows.length) {
      req.flash('error', 'Email or username already in use.');
      return res.redirect('/auth/register');
    }

    const hash = await bcrypt.hash(password, 10);
    const colors = ['#38bdf8','#818cf8','#f472b6','#34d399','#fb923c','#a78bfa'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash, avatar_color) VALUES ($1,$2,$3,$4) RETURNING *',
      [username.trim(), email.toLowerCase().trim(), hash, color]
    );

    req.login(rows[0], (err) => {
      if (err) throw err;
      req.flash('success', `Welcome, ${rows[0].username}! 🎉`);
      res.redirect('/');
    });
  } catch (err) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
});

// POST logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out.');
    res.redirect('/auth/login');
  });
});

export default router;
