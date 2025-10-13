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
        nisNpm,
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

      // 💡 Validasi nomor telepon: hanya angka dan maksimal 14 digit
      if (!/^\d{1,14}$/.test(telepon)) {
        return res.render('user/daftar-magang/index', {
          username: req.session.user?.username || 'Pengguna',
          error: 'Nomor telepon harus berupa angka dan maksimal 14 digit.',
          success: false,
        });
      }
      // 💡 Cek apakah user sudah pernah daftar
      const sudahDaftar = await Participant.findOne({ where: { userId } });
      if (sudahDaftar) {
        return res.render('user/daftar-magang/index', {
          username: req.session.user?.username || 'Pengguna',
          error: 'Anda sudah pernah mendaftar magang. Tidak bisa daftar 2 kali.',
          success: false,
        });
      }
// 💡 Cek apakah NIS/NPM sudah pernah digunakan
const existingNis = await Participant.findOne({ where: { nisNpm } });
if (existingNis) {
  return res.render('user/daftar-magang/index', {
    username: req.session.user?.username || 'Pengguna',
    error: 'NIS/NPM sudah pernah terdaftar.',
    success: false,
  });
}


      // 💾 Simpan data ke database
      await Participant.create({
        userId,
        nama: namaLengkap,
        alamat,
        nisNpm,
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
      return res.redirect('/user/dashboard?success=true');
    } catch (err) {
      console.error('❌ Gagal menyimpan data peserta:', err);

      // ❌ Render kembali halaman dengan error (✅ diperbaiki di sini)
      return res.render('user/daftar-magang/index', {
        username: req.session.user?.username || 'Pengguna',
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
