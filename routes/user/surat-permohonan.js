const express = require('express');
const router = express.Router();
const { SuratPermohonan } = require('../../models');
const multer = require('multer');
const path = require('path');

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/suratPermohonan/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware pastikan user login
const ensureUser = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Silakan login terlebih dahulu' });
  next();
};

// List surat user
router.get('/', ensureUser, async (req, res) => {
  try {
    const suratList = await SuratPermohonan.findAll({ where: { userId: req.user.id } });
    res.json(suratList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload surat user
router.post('/upload', ensureUser, upload.single('suratPermohonan'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File harus diunggah' });

    const surat = await SuratPermohonan.create({
      suratPermohonan: file.filename,
      userId: req.user.id,
    });

    res.status(201).json(surat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detail surat user
router.get('/:id', ensureUser, async (req, res) => {
  try {
    const surat = await SuratPermohonan.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!surat) return res.status(404).json({ error: 'Surat tidak ditemukan' });
    res.json(surat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hapus surat user
router.delete('/:id', ensureUser, async (req, res) => {
  try {
    const surat = await SuratPermohonan.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!surat) return res.status(404).json({ error: 'Surat tidak ditemukan' });

    await surat.destroy();
    res.json({ message: 'Surat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
