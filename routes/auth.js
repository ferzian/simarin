const express = require('express');
const router = express.Router();
const { User } = require('../models'); // ✅ Benar
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Approval Akun
router.get('/admin/approval-akun', isAuthenticated, isAdmin, async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });
  res.render('admin/approval-akun', { pendingUsers });
});

// Approval Peserta
router.get('/admin/approval-peserta', isAuthenticated, isAdmin, async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });
  res.render('admin/approval-peserta', { pendingUsers });
});

// Peserta
router.get('/admin/peserta', isAuthenticated, isAdmin, async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });
  res.render('admin/peserta', { pendingUsers });
});

// SKM
router.get('/admin/skm', isAuthenticated, isAdmin, async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false },
  });
  res.render('admin/skm', { pendingUsers });
});


// GET Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });

  if (!user) {
    return res.render('login', { error: 'Username atau password salah' });
  }
  if (!user.approved && user.role !== 'admin') {
    return res.render('login', { error: 'Akun kamu belum disetujui admin.' });
  }

  // Simpan ke session
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    isApproved: user.approved
  };


  // Redirect sesuai role
  if (user.role === 'admin') {
    return res.redirect('/auth/admin/dashboard');
  }

  res.redirect('/auth/user/dashboard');
});


// GET Register
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});


// POST Register
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    confirmPassword,
    email,
    phone,
    dob,
    countryCode,
  } = req.body;

  // Validasi password dan konfirmasi
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Password tidak sama.' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.render('register', { error: 'Username sudah digunakan.' });
    }

    // Simpan data baru
    await User.create({
      username,
      password,
      email,
      phone,
      dob,
      countryCode,
      role: 'user',
      approved: false,
    });

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Terjadi kesalahan saat register.' });
  }
});


// GET User Dashboard
router.get('/user/dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  res.render('user/user-dashboard', {
    username: req.session.user.username
  });
});
// user-daftar-magang
router.get('/user/daftar-magang', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  res.render('user/daftar-magang', {
    username: req.session.user.username
  });
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
