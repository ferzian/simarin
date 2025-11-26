const express = require('express');
const router = express.Router();
const { Participant, Laporan, SuratPermohonan, PendaftaranMagang } = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Pastikan folder upload ada
const laporanDir = path.join(__dirname, '../../public/uploads/laporan/');
if (!fs.existsSync(laporanDir)) {
  fs.mkdirSync(laporanDir, { recursive: true });
}

// ⚙️ Konfigurasi Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, laporanDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/// 🟡 GET halaman upload laporan
router.get('/skm/upload', isUser, async (req, res) => {
  try {
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }
    });

    res.render('user/daftar-magang/laporan', {
      username: req.session.user.username,
      laporan // ✅ dikirim ke EJS agar tidak undefined
    });
  } catch (err) {
    console.error('❌ Error load halaman laporan:', err);
    res.status(500).send('Terjadi kesalahan server saat memuat halaman laporan');
  }
});


// 🟢 POST upload laporan
router.post('/skm/upload', isUser, upload.single('laporanFile'), async (req, res) => {
  try {
    const filePath = `/uploads/laporan/${req.file.filename}`;

    // Simpan ke database
    await Laporan.create({
      userId: req.session.user.id,
      file: filePath,
      status: 'menunggu_approval'
    });

    console.log('✅ Laporan berhasil diupload:', filePath);

    // Redirect balik ke halaman SKM
    res.redirect('/user/skm');
  } catch (err) {
    console.error('❌ Error upload laporan:', err);
    res.status(500).send('Gagal upload laporan.');
  }
});
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

    // 🔹 Ambil data laporan
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id },
      include: [{ model: Participant, as: "participant" }]
    });

    // 🔹 Ambil data upload Susan (pastikan model UploadSusan sudah di-import di atas)
    const { UploadSusan } = require('../../models');
    const susan = await UploadSusan.findOne({ where: { userId: req.session.user.id } });

    // Tentukan status laporan
    let statusLaporan = 'belum_upload';
    if (laporan) {
      if (laporan.status === 'approved') statusLaporan = 'approved';
      else if (laporan.status === 'rejected') statusLaporan = 'rejected';
      else statusLaporan = 'menunggu_approval';
    }

    // Tentukan status upload Susan
    let statusUploadSusan = 'belum_upload';
    if (susan) {
      if (susan.status === 'approved') statusUploadSusan = 'approved';
      else if (susan.status === 'pending') statusUploadSusan = 'menunggu_approval';
    }

    // 🔹 Kirim ke EJS
    res.render('user/daftar-magang/skm', {
      isRegistered: participant,
      statusLaporan,
      statusUploadSusan, // ✅ dikirim ke EJS
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
