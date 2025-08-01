const express = require('express');
const router = express.Router();
const { User } = require('../models');
const sendAdminNotification = require('../utils/sendAdminNotification');

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

    // Simpan user baru
    const newUser = await User.create({
      username,
      password,
      email,
      phone,
      dob,
      countryCode,
      role: 'user',
      approved: false,
    });

    // Kirim notifikasi ke admin
    await sendAdminNotification(newUser);

    res.redirect('/?registered=success');
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

// GET halaman permintaan sertifikat
router.get('/user/daftar-magang/sertifikat', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  res.render('user/daftar-magang/sertifikat', {
    username: req.session.user.username
  });
});


// user surat-kepuasan-masyarakat
router.get('/user/skm', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  res.render('user/skm', {
    username: req.session.user.username
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


module.exports = router;
