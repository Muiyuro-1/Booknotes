import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { filter = 'all', sort = 'newest', search = '', status = 'all' } = req.query;
    const uid = req.user?.id || null;

    const params = [];
    const conditions = [];

    if (uid) {
      params.push(uid);
      conditions.push(`r.user_id = $${params.length}`);
    }
    if (filter === 'book' || filter === 'movie') {
      params.push(filter);
      conditions.push(`r.type = $${params.length}`);
    }
    if (status !== 'all' && ['completed','in_progress','want_to'].includes(status)) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }
    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      const idx = params.length;
      conditions.push(`(r.title ILIKE $${idx} OR r.author_director ILIKE $${idx} OR r.genre ILIKE $${idx})`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderMap = { rating: 'r.rating DESC', title: 'r.title ASC', newest: 'r.created_at DESC' };
    const order = orderMap[sort] || orderMap.newest;

    const result = await pool.query(`SELECT r.* FROM reviews r ${where} ORDER BY ${order}`, params);

    const statsParams = uid ? [uid] : [];
    const statsWhere  = uid ? 'WHERE user_id=$1' : '';
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE type='book')   AS books,
        COUNT(*) FILTER (WHERE type='movie')  AS movies,
        COUNT(*) FILTER (WHERE favorite=true) AS favorites,
        ROUND(AVG(rating),1) AS avg_rating
      FROM reviews ${statsWhere}
    `, statsParams);

    res.render('index', {
      title: 'BookNotes — My Reading & Watching Log',
      reviews: result.rows,
      stats: statsResult.rows[0],
      filter, sort, search, status
    });
  } catch (err) {
    next(err);
  }
});

export default router;
