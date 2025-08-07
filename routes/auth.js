const { Op } = require('sequelize'); // Jangan lupa import Op
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // untuk kirim email
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail', // atau pakai 'smtp.mailtrap.io' buat testing
  auth: {
    user: 'm.ferzian09@gmail.com', // ganti dengan email kamu
    pass: 'zvlg tunj uthw ldcg',   // GMAIL: gunakan App Password, bukan password biasa
  },
});

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
  const expires = Date.now() + 1000 * 60 * 15; // 15 menit

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
    token: null, // supaya form tidak ditampilkan lagi
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

    res.clearCookie('connect.sid'); // Hapus cookie sesi (opsional)
    res.redirect('/login'); // Arahkan ke halaman login
  });
});


module.exports = router;
