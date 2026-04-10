import express from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../db/middleware.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user.id;

    const [overview, genreStats, ratingDist, recentActivity, topRated, timeline] = await Promise.all([
      // Overview counts + averages
      pool.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE type='book')  AS books,
          COUNT(*) FILTER (WHERE type='movie') AS movies,
          COUNT(*) FILTER (WHERE favorite=true) AS favorites,
          COUNT(*) FILTER (WHERE status='want_to') AS want_to,
          COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
          ROUND(AVG(rating),2) AS avg_rating,
          ROUND(AVG(rating) FILTER (WHERE type='book'),2)  AS avg_book_rating,
          ROUND(AVG(rating) FILTER (WHERE type='movie'),2) AS avg_movie_rating,
          MAX(rating) AS highest_rating
        FROM reviews WHERE user_id=$1
      `, [uid]),

      // Top genres
      pool.query(`
        SELECT genre, COUNT(*) AS count, ROUND(AVG(rating),1) AS avg_rating
        FROM reviews WHERE user_id=$1 AND genre IS NOT NULL AND genre != ''
        GROUP BY genre ORDER BY count DESC LIMIT 8
      `, [uid]),

      // Rating distribution 1–10
      pool.query(`
        SELECT rating, COUNT(*) AS count
        FROM reviews WHERE user_id=$1 AND rating IS NOT NULL
        GROUP BY rating ORDER BY rating
      `, [uid]),

      // Last 5 reviews
      pool.query(`
        SELECT * FROM reviews WHERE user_id=$1
        ORDER BY created_at DESC LIMIT 5
      `, [uid]),

      // Top rated (10s and 9s)
      pool.query(`
        SELECT * FROM reviews WHERE user_id=$1 AND rating >= 9
        ORDER BY rating DESC, created_at DESC LIMIT 6
      `, [uid]),

      // Reviews per month (last 12 months)
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
          COUNT(*) AS count
        FROM reviews WHERE user_id=$1 AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `, [uid])
    ]);

    res.render('stats', {
      title: 'My Dashboard — BookNotes',
      user: req.user,
      overview: overview.rows[0],
      genreStats: genreStats.rows,
      ratingDist: ratingDist.rows,
      recentActivity: recentActivity.rows,
      topRated: topRated.rows,
      timeline: timeline.rows,
      flash: { success: req.flash('success'), error: req.flash('error') }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
