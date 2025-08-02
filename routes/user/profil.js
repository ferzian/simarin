const express = require('express');
const router = express.Router();
const { Participant, User } = require('../../models'); // Tambahkan User

// GET /user/profil
router.get('/profil', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }

  try {
    const userId = req.session.user.id;

    // Ambil data peserta magang
    const participant = await Participant.findOne({ where: { userId } });

    // Ambil data akun user
    const user = await User.findByPk(userId); // ambil dari model User

    res.render('user/profil', {
      username: req.session.user.username, // tetap ditampilkan di bagian atas
      participant,
      user, // kirim data user ke view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
});

module.exports = router;
