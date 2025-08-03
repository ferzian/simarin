const express = require('express');
const router = express.Router();

// Middleware: pastikan user login & role user
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET dashboard user
router.get('/dashboard', isUser, (req, res) => {
  res.render('user/user-dashboard', {
    username: req.session.user.username
  });
});

// GET halaman permintaan sertifikat
router.get('/daftar-magang/sertifikat', isUser, (req, res) => {
  res.render('user/daftar-magang/sertifikat', {
    username: req.session.user.username
  });
});

// GET halaman SKM
router.get('/skm', isUser, (req, res) => {
  res.render('user/skm', {
    username: req.session.user.username
  });
});

// POST logout (bisa juga dipindah ke routes/auth.js kalau ingin pisah total)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/user/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;
