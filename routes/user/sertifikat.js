const express = require('express');
const router = express.Router();

router.get('/sertifikat', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  res.render('user/sertifikat/index', { username: req.session.user.username });
});

module.exports = router;
