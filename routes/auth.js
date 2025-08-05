const { Op } = require('sequelize'); // Jangan lupa import Op
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

// GET Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { loginId, password } = req.body; // ← pakai loginId

  try {
    // Cari berdasarkan username ATAU email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: loginId }, { email: loginId }]
      }
    });

    if (!user) {
      return res.render('login', { error: 'Username/email atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render('login', { error: 'Username/email atau password salah' });
    }

    // Simpan ke session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.approved
    };

    // Redirect
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }

    res.redirect('/user/dashboard');
  } catch (err) {
    console.error('❌ Login error:', err);
    res.render('login', { error: 'Terjadi kesalahan saat login.' });
  }
});

// GET Register
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST Register
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword, email, phone, instansi } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // tambahkan ini

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Password tidak sama.' });
  }

  try {
    // Cek apakah username ATAU email sudah ada (OR condition)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.render('register', { error: 'Username sudah digunakan.' });
      }
      if (existingUser.email === email) {
        return res.render('register', { error: 'Email sudah digunakan.' });
      }
    }

    // Buat user baru
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      phone,
      instansi,
      role: 'user',
      approved: true, // Langsung approved tanpa verifikasi admin
    });

    res.redirect('/?registered=success');
  } catch (err) {
    console.error(err);
    // Beri pesan error yang lebih spesifik
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.render('register', { error: 'Username atau email sudah terdaftar.' });
    }
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
