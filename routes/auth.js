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
    return res.redirect('/admin/dashboard');
  }

  res.redirect('/user/dashboard');
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
    instansi,
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
      instansi,
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

// POST Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Gagal logout:', err);
      return res.status(500).send('Logout gagal');
    }

    res.clearCookie('connect.sid'); // Hapus cookie sesi (opsional)
    res.redirect('/login'); // Arahkan ke halaman login
  });
});


module.exports = router;
