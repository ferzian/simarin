const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/data-peserta', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participants = await Participant.findAll({
      include: [
        {
          model: User,
          where: { role: 'user'}, // hanya user yang approved
        },
      ],
    });

    const formatDate = (dateStr) =>
      new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });


    res.render('admin/data-peserta', {
      participants: participants.map((p) => ({
        nama: p.nama,
        nipNim: p.nipNim,
        jenisKelamin: p.jenisKelamin,
        telepon: p.telepon,
        alamat: p.alamat,
        jenjang: p.jenjang,
        instansi: p.instansi,
        prodi: p.prodi,
        kegiatan: p.kegiatan,
        lokasi: p.lokasi,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
      })),
      user: req.session.user
    });
  } catch (err) {
    console.error('❌ Gagal ambil data peserta:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
