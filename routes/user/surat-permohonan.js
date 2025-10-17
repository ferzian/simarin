const express = require('express');
const router = express.Router();
const { SuratPermohonan } = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Folder upload
const uploadDir = 'public/uploads/suratPermohonan/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Hanya file jpg, jpeg, png, dan pdf yang diperbolehkan'));
  },
});

// ✅ Middleware pastikan user login
const ensureUser = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
  }
  req.user = req.session.user; // tambahkan agar kompatibel
  next();
};

// 📄 Ambil daftar surat permohonan user
router.get('/', ensureUser, async (req, res) => {
  try {
    const suratList = await SuratPermohonan.findAll({ where: { userId: req.user.id } });
    res.render('user/surat-permohonan', { suratList });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat data surat permohonan');
  }
});

// 📤 Upload surat permohonan
router.post('/upload', ensureUser, upload.single('suratPermohonan'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'File harus diunggah' });
    }

    // 💡 Simpan path relatif agar bisa diakses lewat public
    const filePath = `/uploads/suratPermohonan/${file.filename}`;

    // 💾 Simpan ke database
    const surat = await SuratPermohonan.create({
      userId: req.user.id,
      suratPermohonan: filePath, // simpan path, bukan hanya nama file
      status: 'pending',
    });

    // ✅ Respon sukses
    res.status(201).json({
      success: true,
      message: 'File berhasil diunggah. Menunggu persetujuan admin.',
      data: surat,
    });
  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat upload file.' });
  }
});


// ❌ Hapus surat
router.delete('/:id', ensureUser, async (req, res) => {
  try {
    const surat = await SuratPermohonan.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
    }

    const filePath = path.join(uploadDir, surat.suratPermohonan);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await surat.destroy();
    res.json({ success: true, message: 'Surat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus surat' });
  }
});

// 🛠️ Handler error dari Multer (ekstensi/ukuran salah)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err.message.includes('Hanya file')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
// 🧭 Dashboard User - Cek apakah surat sudah diupload
router.get('/dashboard', ensureUser, async (req, res) => {
  try {
    const surat = await SuratPermohonan.findOne({
      where: { userId: req.user.id },
    });

    const isUploaded = !!surat; // true jika sudah upload
    res.render('user/user-dashboard', { isUploaded }); // kirim ke ejs
  } catch (err) {
    console.error('❌ Error load dashboard:', err);
    res.status(500).send('Gagal memuat dashboard');
  }
});
