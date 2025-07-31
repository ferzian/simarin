const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/peserta', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participants = await Participant.findAll({
      include: [
        {
          model: User,
          where: { role: 'user', approved: true }, // hanya user yang approved
        },
      ],
    });

    const pendingUsers = await User.findAll({ where: { role: 'user', approved: false } });
    const pendingParticipants = await Participant.findAll({
      where: { statusSelesai: false },
      include: [{ model: User }]
    });

    res.render('admin/peserta', {
      participants: participants.map((p) => ({
        name: p.User.username,
        gender: p.jenisKelamin,
        major: p.jurusan,
        type: p.jenisKegiatan,
        institution: p.asalInstansi,
        startDate: p.tanggalMulai.toISOString().split('T')[0],
        endDate: p.tanggalSelesai.toISOString().split('T')[0],
      })),
      pendingUsers,
      pendingParticipants,
      user: req.session.user
    });
  } catch (err) {
    console.error('❌ Gagal ambil data peserta:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
