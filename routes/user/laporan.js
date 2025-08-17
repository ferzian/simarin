const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Laporan } = require('../../models');

// Middleware: pastikan user login
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// Storage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/laporan/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET form laporan
router.get('/laporan', isUser, (req, res) => {
  res.render('user/daftar-magang/skm/laporan');
});

// POST submit laporan
router.post('/laporan', isUser, upload.single('file_laporan'), async (req, res) => {
  try {
    await Laporan.create({
      userId: req.session.user.id,
      judul: req.body.judul,
      file: req.file.filename
    });

    // Halaman sukses
    res.render('user/daftar-magang/skm/laporan-sukses');
  } catch (err) {
    console.log(err);
    res.status(500).send('Terjadi kesalahan saat upload laporan.');
  }
});

module.exports = router;
