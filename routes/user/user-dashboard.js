const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/login');
  }

  res.render('user/user-dashboard', {
    username: req.session.user.username
  });
});

module.exports = router;
    router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/user/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login'); // pastikan ini route login kamu
  });
});