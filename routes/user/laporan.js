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

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/user/laporan'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET form upload laporan
router.get('/laporan', isUser, async (req, res) => {
  try {
    const laporan = await Laporan.findOne({ where: { userId: req.session.user.id } });
    res.render('user/daftar-magang/laporan', { laporan });
  } catch (error) {
    console.error('Error fetching Laporan:', error);
    res.status(500).send('Terjadi kesalahan server');
  }
});


// POST upload laporan via fetch
router.post('/submit-laporan', isUser, upload.single('laporan'), async (req, res) => {
try {
  if (!req.file) return res.status(400).json({ error: 'File laporan tidak ditemukan' });

  let laporan = await Laporan.findOne({ where: { userId: req.session.user.id } });

  if (laporan) {
    laporan.judul = req.body.judul;
    laporan.fileLaporan = req.file.filename;
  
    // Hanya reset status kalau belum di-approve
    if (laporan.status !== 'approved') {
      laporan.status = 'pending';
    }
  
    await laporan.save();
  } else {
    laporan = await Laporan.create({
      userId: req.session.user.id,
      judul: req.body.judul,
      fileLaporan: req.file.filename,
      status: 'pending'
    });
  }
  

  res.json({ success: true, laporan });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
}
});

module.exports = router;
