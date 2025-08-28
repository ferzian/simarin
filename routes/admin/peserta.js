const express = require('express');
const router = express.Router();
const { User, Participant, Laporan } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/peserta', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingCount = await Laporan.count({ where: { status: 'pending' } });
    const participants = await Participant.findAll({
      include: [
        {
          model: User,
          where: { role: 'user', approved: true },
        },
      ],
    });

    const formatDate = (dateStr) =>
      new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });


    res.render('admin/peserta', {
      participants: participants.map((p) => ({
        nama: p.nama,
        jenisKelamin: p.jenisKelamin,
        prodi: p.prodi,
        kegiatan: p.kegiatan,
        instansi: p.instansi,
        lokasi: p.lokasi,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
      })),
      user: req.session.user,
      pendingCount
    });
  } catch (err) {
    console.error('❌ Gagal ambil data peserta:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
