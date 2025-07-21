const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });

  if (!user) return res.send('Login gagal.');

  if (user.role === 'admin') {
  return res.redirect('/auth/admin/dashboard');
}

  if (!user.approved) {
    return res.send('Akun kamu belum disetujui admin.');
  }

  res.render('user-dashboard', { username: user.username });
});

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ where: { username } });
  if (existing) return res.send('Username sudah dipakai.');

  await User.create({ username, password });
  res.send('Registrasi berhasil! Tunggu persetujuan admin.');
});

// Tampilkan dashboard admin
router.get('/admin/dashboard', async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });

  res.render('admin-dashboard', { pendingUsers });
});

// Proses approval user
router.post('/admin/approve/:id', async (req, res) => {
  const { id } = req.params;

  await User.update({ approved: true }, { where: { id } });

  res.redirect('/auth/admin/dashboard');
});


module.exports = router;
