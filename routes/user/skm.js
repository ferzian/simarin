const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Laporan = require('../../models/Laporan'); // Sesuaikan path model Anda

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/laporan/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware untuk cek auth
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// GET - Halaman SKM
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Ambil data laporan dari database

    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }, include: [{ model: Participant, as: "participant" }]

    });

    // Tentukan status yang akan dikirim ke frontend
    let statusLaporan = 'belum_upload';

    if (laporan) {
      if (laporan.status == 'approved') {
        statusLaporan = 'approved';
      } else if (laporan.status == 'rejected') {
        statusLaporan = 'rejected';
      } else {
        statusLaporan = 'menunggu_approval';
      }
    } else {
      statusLaporan = 'belum_upload';
    }

    console.log('Status laporan yang dikirim:', statusLaporan); // Debug

    res.render('user/daftar-magang/skm', {
      title: 'Alur Selesai Magang - SKM',
      statusLaporan: statusLaporan, // VARIABLE YANG DIPAKAI DI FRONTEND
      user: req.user
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
});

// POST - Upload laporan
router.post('/upload', isAuthenticated, upload.single('laporan'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    // Simpan data ke database
    const newLaporan = new Laporan({
      userId: req.user.id,
      filePath: req.file.path,
      status: 'pending'
    });

    await newLaporan.save();

    res.json({
      success: true,
      message: 'Laporan berhasil diupload, menunggu approval admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal upload laporan' });
  }
});

// Route untuk check status (auto-refresh)
router.get('/check-status', isAuthenticated, async (req, res) => {
  try {

    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }, include: [{ model: Participant, as: "participant" }]
    }).sort({ tanggalUpload: -1 });

    let status = 'belum_upload';
    if (laporan) {
      status = laporan.status === 'approved' ? 'approved' :
        laporan.status === 'rejected' ? 'rejected' : 'menunggu_approval';
    }

    res.json({ status: status });
  } catch (error) {
    res.json({ status: 'belum_upload' });
  }
});

// Route untuk admin approve
router.post('/approve/:laporanId', async (req, res) => {
  try {
    await Laporan.update(
      { status: 'approved', tanggalApproval: new Date() },
      { where: { id: req.params.laporanId } }
    );
    res.json({ success: true, message: 'Laporan disetujui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal approve laporan' });
  }
});

// Route untuk download sertifikat
router.get('/download-sertifikat', isAuthenticated, async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      '../../uploads/sertifikat',
      `sertifikat-${req.user.id}.pdf`
    );

    res.download(filePath, `sertifikat-${req.user.id}.pdf`, (err) => {
      if (err) {
        console.error("Gagal download:", err);
        return res.status(500).send("Sertifikat belum tersedia.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mendownload sertifikat.');
  }
});

// Route untuk check status
router.get('/check-status', isAuthenticated, async (req, res) => {
  try {

    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }, include: [{ model: Participant, as: "participant" }]
    });

    let status = 'belum_upload';
    if (laporan) {
      status = laporan.status === 'approved' ? 'approved' :
        laporan.status === 'rejected' ? 'rejected' : 'menunggu_approval';
    }

    res.json({ status: status });
  } catch (error) {
    console.error(error);
    res.json({ status: 'belum_upload' });
  }
});