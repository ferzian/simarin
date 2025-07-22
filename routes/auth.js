const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Route yang cuma boleh diakses admin
router.get('/approval', isAuthenticated, isAdmin, async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });
  res.render('admin/approval', { pendingUsers });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });

  if (!user) return res.send('Login gagal.');
  if (!user.approved && user.role !== 'admin') {
    return res.send('Akun kamu belum disetujui admin.');
  }

  // ✅ Simpan data ke session
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;

  // Redirect sesuai role
  if (user.role === 'admin') {
    return res.redirect('/auth/admin/dashboard');
  }

  res.redirect('/auth/user/dashboard');
});


// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 4) {
    return res.send('Username dan password wajib diisi (min 4 karakter).');
  }

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

  res.render('admin/index', { pendingUsers });
});

// Proses approval user
router.post('/admin/approve/:id', async (req, res) => {
  const { id } = req.params;

  await User.update({ approved: true }, { where: { id } });

  res.redirect('/auth/admin/dashboard');
});

// Tolak user
router.post('/admin/reject/:id', async (req, res) => {
  const { id } = req.params;

  await User.destroy({ where: { id } });

  res.redirect('/auth/admin/dashboard?msg=reject');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



module.exports = router;
