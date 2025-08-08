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
          where: { role: 'user', approved: true }, // hanya user yang approved
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
        nama: p.User.username,
        jenisKelamin: p.jenisKelamin,
        prodi: p.prodi,
        instansi: p.instansi,
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
