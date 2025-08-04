const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = require('../../middleware/upload');
const { Participant } = require('../../models');

// 💡 Middleware: Cek login dan role user
router.get('/', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  const success = req.query.success === 'true';

  // 💡 Render halaman form magang
  res.render('user/daftar-magang/index', {
    username: req.session.user.username,
    error: null,
    success,
  });
});

// 💡 Route POST: Proses penyimpanan data magang
router.post(
  '/',
  upload.fields([
    { name: 'surat_pengantar', maxCount: 1 },
    { name: 'pas_foto', maxCount: 1 },
    { name: 'surat_sehat', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      const {
        namaLengkap,
        alamat,
        nipNim,
        telepon,
        institusi,
        prodi,
        jenjang,
        jenisKelamin,
        tanggalMulai,
        tanggalSelesai,
        kegiatan,
        lokasi,
      } = req.body;

      // 💡 Validasi nomor telepon unik
      const existing = await Participant.findOne({ where: { telepon } });
      if (existing) {
        return res.render('user/daftar-magang/index', {
          username: req.session.user?.username || 'Pengguna',
          error: 'Nomor telepon sudah digunakan.',
          success: false,
        });
      }

      // 💾 Simpan data ke database
      await Participant.create({
        userId,
        nama: namaLengkap,
        alamat,
        nipNim,
        telepon,
        instansi: institusi,
        prodi,
        jenjang,
        jenisKelamin,
        tanggalMulai,
        tanggalSelesai,
        kegiatan,
        lokasi,
        suratPengantar: req.files['surat_pengantar']?.[0].filename,
        pasFoto: req.files['pas_foto']?.[0].filename,
        suratSehat: req.files['surat_sehat']?.[0].filename,
        statusSelesai: false,
      });

      // ✅ Redirect dengan query success
      return res.redirect('/user/daftar-magang?success=true');
    } catch (err) {
      console.error('❌ Gagal menyimpan data peserta:', err);

      // ❌ Render kembali halaman dengan error
      return res.render('user/daftar-magang/index', {
        username: req.session.user.username,
        error: 'Terjadi kesalahan saat menyimpan data.',
        success: false,
      });
    }
  }
);

// 💡 AJAX: Pengecekan nomor telepon unik
router.get('/cek-telepon', async (req, res) => {
  try {
    const { telepon } = req.query;
    const existing = await Participant.findOne({ where: { telepon } });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error('❌ Gagal cek telepon:', err);
    res.status(500).json({ error: 'Gagal memeriksa telepon' });
  }
});

module.exports = router;
