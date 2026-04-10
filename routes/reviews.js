import express from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../db/middleware.js';

const router = express.Router();

// All review routes require auth
router.use(requireAuth);

// GET new form
router.get('/new', (req, res) => {
  res.render('form', {
    title: 'Add New Review',
    review: null,
    action: '/reviews',
    method: 'POST'
  });
});

// GET single review
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).render('404', { title: 'Not Found' });
    res.render('detail', { title: rows[0].title, review: rows[0] });
  } catch (err) { next(err); }
});

// GET edit form
router.get('/:id/edit', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).render('404', { title: 'Not Found' });
    res.render('form', {
      title: 'Edit Review',
      review: rows[0],
      action: `/reviews/${rows[0].id}?_method=PUT`,
      method: 'POST'
    });
  } catch (err) { next(err); }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const { type, title, author_director, cover_url, rating, review, notes, genre, year, status, favorite } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id,type,title,author_director,cover_url,rating,review,notes,genre,year,status,favorite)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [req.user.id, type, title, author_director||null, cover_url||null, rating||null,
       review||null, notes||null, genre||null, year||null, status||'completed', favorite==='on']
    );
    req.flash('success', `"${title}" added to your journal! 🎉`);
    res.redirect(`/reviews/${rows[0].id}`);
  } catch (err) { next(err); }
});

// PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const { type, title, author_director, cover_url, rating, review, notes, genre, year, status, favorite } = req.body;
    await pool.query(
      `UPDATE reviews SET type=$1,title=$2,author_director=$3,cover_url=$4,rating=$5,
       review=$6,notes=$7,genre=$8,year=$9,status=$10,favorite=$11,updated_at=NOW()
       WHERE id=$12 AND user_id=$13`,
      [type, title, author_director||null, cover_url||null, rating||null,
       review||null, notes||null, genre||null, year||null, status||'completed',
       favorite==='on', req.params.id, req.user.id]
    );
    req.flash('success', 'Review updated.');
    res.redirect(`/reviews/${req.params.id}`);
  } catch (err) { next(err); }
});

// PATCH toggle favorite
router.patch('/:id/favorite', async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE reviews SET favorite = NOT favorite WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    req.flash('success', 'Review deleted.');
    res.redirect('/');
  } catch (err) { next(err); }
});

export default router;
