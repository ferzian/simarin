const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const { Participant } = require('../../models');

// Middleware: Cek apakah user sudah login & role-nya 'user'
router.get('/', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  // Render halaman daftar magang
  res.render('user/daftar-magang/index', {
    username: req.session.user.username
  });
});

// Handler untuk proses POST form pendaftaran magang
router.post('/', upload.fields([
  { name: 'suratPengantar', maxCount: 1 },
  { name: 'pasFoto', maxCount: 1 },
  { name: 'suratSehat', maxCount: 1 }
]), async (req, res) => {
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
      lokasi
    } = req.body;

    // Simpan data ke database
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
        suratPengantar: req.files.suratPengantar?.[0].filename,
        pasFoto: req.files.pasFoto?.[0].filename,
        suratSehat: req.files.suratSehat?.[0].filename,
        statusSelesai: false
      });
      

    // Redirect ke halaman sertifikat setelah berhasil submit
    res.redirect('/auth/user/sertifikat');
  } catch (err) {
    console.error('❌ Gagal menyimpan data peserta:', err);
    res.status(500).send("Terjadi kesalahan saat menyimpan data.");
  }
});

module.exports = router;
