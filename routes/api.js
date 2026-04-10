import express from 'express';
import axios from 'axios';
import { requireAuth } from '../db/middleware.js';

const router = express.Router();

// GET /api/cover?type=book&title=...&author=...
// GET /api/cover?type=movie&title=...&year=...
router.get('/cover', requireAuth, async (req, res) => {
  const { type, title, author, year } = req.query;
  if (!title) return res.json({ url: null });

  try {
    if (type === 'book') {
      // Open Library search
      const query = encodeURIComponent(author ? `${title} ${author}` : title);
      const { data } = await axios.get(
        `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_i,title`,
        { timeout: 5000 }
      );
      if (data.docs?.[0]?.cover_i) {
        const coverId = data.docs[0].cover_i;
        return res.json({ url: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` });
      }
      return res.json({ url: null });

    } else if (type === 'movie') {
      // OMDB (requires free API key — falls back to null if none set)
      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey) return res.json({ url: null, note: 'Set OMDB_API_KEY in .env for movie covers' });

      const params = new URLSearchParams({ apikey: apiKey, t: title, type: 'movie' });
      if (year) params.append('y', year);

      const { data } = await axios.get(`https://www.omdbapi.com/?${params}`, { timeout: 5000 });
      if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
        return res.json({ url: data.Poster });
      }
      return res.json({ url: null });
    }

    res.json({ url: null });
  } catch (err) {
    console.error('Cover fetch error:', err.message);
    res.json({ url: null });
  }
});

export default router;
