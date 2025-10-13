const { Op } = require('sequelize');
const { User } = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../utils/transporter');
const router = express.Router();

// GET Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
router.post('/login', async (req, res) => {
  const { loginId, password } = req.body;

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

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Password tidak sama.' });
  }

  try {
    // Cek apakah username ATAU email sudah ada
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
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

    // Hitung berapa user yang daftar hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const countToday = await User.count({
      where: {
        createdAt: { [Op.gte]: startOfDay },
      },
    });

    // Nomor antrian = jumlah user hari ini + 1
    const queueNumber = countToday + 1;
    const formattedQueue = queueNumber.toString().padStart(3, '0');

    // Hash password dan buat user baru
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      email,
      phone,
      instansi,
      role: 'user',
      approved: true,
    });

    // Kirim nomor antrian lewat query parameter (tanpa disimpan di DB)
    res.redirect(`/register?registered=success&queue=${formattedQueue}`);

  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.render('register', { error: 'Username atau email sudah terdaftar.' });
    }
    res.render('register', { error: 'Terjadi kesalahan saat register.' });
  }
});


// GET - Form lupa password
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null });
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.render('forgot-password', { error: 'Email tidak ditemukan' });
  }

  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 1000 * 60 * 15;

  await user.update({
    resetToken: token,
    resetTokenExpires: new Date(expires)
  });

  const resetUrl = `http://localhost:3000/auth/reset-password/${token}`;

  // Kirim email
  await transporter.sendMail({
    from: '"SIMARIN Support" <m.ferzian09@gmail.com>',
    to: user.email,
    subject: 'Reset Password',
    html: `
    <div style="font-family: Poppins, sans-serif; background-color: #f0f4f8; padding: 2rem;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 2rem;">
        <h1 style="text-align: center; color: #1e40af; font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem;">SIMARIN</h1>
        <p style="font-size: 1rem; color: #4b5563; line-height: 1.5rem; margin-bottom: 1rem;">
          Halo <strong>${user.username}</strong>,
        </p>
        <p style="font-size: 1rem; color: #4b5563; line-height: 1.5rem; margin-bottom: 1.5rem;">
          Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.
        </p>
        <a href="${resetUrl}" style="display: block; width: fit-content; margin: 0 auto; padding: 0.75rem 1.5rem; background-color: #2563eb; color: #ffffff; text-align: center; border-radius: 9999px; font-weight: 600; text-decoration: none; transition: background-color 0.3s ease-in-out;">
          Atur Ulang Password
        </a>
        <p style="font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 1.5rem;">
          Tautan ini akan kedaluwarsa dalam 15 menit.
        </p>
        <p style="font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 2rem;">
          Jika tombol di atas tidak berfungsi, Anda bisa menyalin dan menempelkan tautan berikut ke browser Anda:
          <br>
          <a href="${resetUrl}" style="word-break: break-all; font-size: 0.875rem; color: #2563eb;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `
  });

  res.render('forgot-password', { success: 'Link reset sudah dikirim ke email!', error: null });
});

// GET Reset Password Form
router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.send('Token tidak valid atau sudah kadaluarsa.');
  }

  res.render('reset-password', {
    token,
    error: null,
    success: null
  });
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('reset-password', {
      token,
      error: 'Password tidak sama.',
      success: null
    });
  }

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.render('reset-password', {
      token,
      error: 'Token tidak valid atau sudah kadaluarsa.',
      success: null
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  // render halaman yang sama, tapi dengan popup success + auto-redirect
  res.render('reset-password', {
    token: null,
    error: null,
    success: 'Password berhasil direset. Kamu akan diarahkan ke halaman login...'
  });
});


// POST Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Gagal logout:', err);
      return res.status(500).send('Logout gagal');
    }

    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
   // Di sinilah kamu tambahkan session user:
   req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    surat_pengantar: user.surat_pengantar,
    isUploaded: !!user.surat_pengantar // <-- bagian pentingnya disini
  };

  res.redirect('/user/user-dashboard');
});

module.exports = router;
