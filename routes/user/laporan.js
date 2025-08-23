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


  // POST upload laporan
  router.post('/laporan', isUser, upload.single('laporan'), async (req, res) => {
    if (!req.file) return res.status(400).send('File laporan tidak ditemukan');

    const existing = await Laporan.findOne({ where: { userId: req.session.user.id } });

    if (existing) {
      existing.fileLaporan = req.file.filename;  // update laporan
      await existing.save();
    } else {
      await Laporan.create({
        userId: req.session.user.id,
        fileLaporan: req.file.filename  // create laporan baru
      });
    }

    res.redirect('/user/laporan');
  });

  module.exports = router;
