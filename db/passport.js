import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pool from './pool.js';

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (!rows.length) return done(null, false, { message: 'No account found with that email.' });
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, avatar_color, created_at FROM users WHERE id = $1', [id]);
    done(null, rows[0] || false);
  } catch (err) {
    done(err);
  }
});

export default passport;
