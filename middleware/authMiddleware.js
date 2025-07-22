function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.redirect('/');
}

module.exports = { isAuthenticated, isAdmin };
