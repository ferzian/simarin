// middleware/authMiddleware.js
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/');
}

function isAdmin(req, res, next) {
  if (req.session.role === 'admin') {
    return next();
  }
  res.status(403).send('Akses ditolak');
}

module.exports = { isAuthenticated, isAdmin };
