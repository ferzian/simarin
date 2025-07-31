const express = require('express');
const router = express.Router();
// <<<<<<< HEAD
const { User } = require('../models');
// =======
// const { User } = require('../models');
// >>>>>>> 701409f4f82f10fbad6ffdac85f4631db32721c3
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
  // const pendingUsers = await User.findAll({
  //   where: { role: 'user', approved: false },
  // });
  // Data dummy untuk pengembangan UI
  // Hapus atau ganti ini dengan data dari database Anda nanti
  const pendingParticipants = [
    {
      id: 1,
      name: "Budi Santoso",
      institution: "Universitas ABC",
      applicationType: "Magang",
      startDate: "2025-08-01",
      endDate: "2025-11-30",
      letterUrl: "#",
      photoUrl: "#",
      transcriptUrl: "#",
    },
    {
      id: 2,
      name: "Siti Aminah",
      institution: "SMK Negeri 1 Jakarta",
      applicationType: "PKL",
      startDate: "2025-09-10",
      endDate: "2025-12-10",
      letterUrl: "#",
      photoUrl: "#",
      transcriptUrl: "#",
    },
  ];

  // Pastikan user juga dikirim, karena UI Anda menggunakannya
  const user = { username: 'admin' }; // Data dummy user, sesuaikan jika Anda sudah punya dari sesi login

  // Jika Anda juga memiliki pendingUsers untuk notifikasi di header, kirimkan juga
  const pendingUsers = []; // Data dummy untuk pendingUsers

  res.render('admin/approval-peserta', {
    pendingParticipants: pendingParticipants,
    user: user, // Pastikan user dikirim
    pendingUsers: pendingUsers // Pastikan pendingUsers dikirim
  });
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
