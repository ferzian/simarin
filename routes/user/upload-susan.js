const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UploadSusan } = require('../../models');

// Middleware: pastikan user login
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// Folder upload
const uploadDir = path.join(__dirname, '../../public/uploads/user/susan');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ GET halaman upload screenshot
router.get('/', isUser, async (req, res) => {
  try {
    const existing = await UploadSusan.findOne({
      where: { userId: req.session.user.id }
    });

    // Render halaman dengan data existing (jika sudah upload sebelumnya)
    res.render('user/daftar-magang/upload-susan', {
      existing,
      fileUrl: existing
        ? `/uploads/user/susan/${existing.filePath}`
        : null
    });
  } catch (err) {
    console.error('❌ GET upload-susan error:', err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// ✅ POST upload screenshot
router.post('/', isUser, upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }

    const userId = req.session.user.id;
    const filePath = req.file.filename;

    let existing = await UploadSusan.findOne({ where: { userId } });

    if (existing) {
      // Hapus file lama jika ada
      const oldFile = path.join(uploadDir, existing.filePath);
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);

      // Update data
      existing.filePath = filePath;
      existing.status = 'pending';
      await existing.save();
    } else {
      // Buat data baru
      await UploadSusan.create({
        userId,
        filePath,
        status: 'pending'
      });
    }

    res.json({ success: true, message: 'Bukti berhasil diupload!' });
  } catch (err) {
    console.error('❌ POST upload-susan error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
