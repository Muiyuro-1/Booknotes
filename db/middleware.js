export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please log in to continue.');
  res.redirect('/auth/login');
}

export function redirectIfAuth(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/');
  next();
}
