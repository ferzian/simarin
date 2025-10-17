const express = require('express');
const router = express.Router();
const { Participant, Laporan, SuratPermohonan, PendaftaranMagang } = require('../../models');

// Middleware: pastikan user login & role user
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET dashboard user
router.get('/dashboard', isUser, async (req, res) => {
  try {
    // cek participant
    const participant = await Participant.findOne({ where: { userId: req.session.user.id } });

    // cek surat permohonan
    const surat = await SuratPermohonan.findOne({ where: { userId: req.session.user.id } });
    const showPopup = !surat || surat.status !== 'approved'; // true jika belum upload atau belum approved
    const suratUploaded = surat && surat.status === 'approved'; // true jika sudah upload & approved

    res.render('user/user-dashboard', {
      isRegistered: participant,
      suratUploaded,   // <-- kirim ke EJS
      username: req.session.user.username,
      showPopup // untuk popup speaker
    });
  } catch (err) {
    console.error('❌ Error load dashboard:', err);
    res.status(500).send('Gagal memuat dashboard');
  }
});

// GET halaman SKM
router.get('/skm', isUser, async (req, res) => {
  try {
    const participant = await Participant.findOne({ where: { userId: req.session.user.id } });

    if (!participant) {
      return res.render('user/user-dashboard', {
        username: req.session.user.username,
        error: 'Silakan daftar magang terlebih dahulu untuk mengakses SKM'
      });
    }

    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id },
      include: [{ model: Participant, as: "participant" }]
    });

    let statusLaporan = 'belum_upload';
    if (laporan) {
      if (laporan.status === 'approved') statusLaporan = 'approved';
      else if (laporan.status === 'rejected') statusLaporan = 'rejected';
      else statusLaporan = 'menunggu_approval';
    }

    res.render('user/daftar-magang/skm', {
      isRegistered: participant,
      statusLaporan,
      username: req.session.user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// GET halaman permintaan sertifikat
router.get('/daftar-magang/sertifikat', isUser, (req, res) => {
  res.render('user/daftar-magang/sertifikat', {
    username: req.session.user.username
  });
});

// POST logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/user/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;
