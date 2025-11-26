const express = require('express');
const router = express.Router();
const { Evaluasi, Participant } = require('../../models');

// Middleware autentikasi
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/user/login');
}

// Halaman form evaluasi
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const participant = await Participant.findOne({ where: { userId } });
    if (!participant) return res.redirect('/user/login');

    // Cek apakah user sudah mengisi evaluasi
    const existing = await Evaluasi.findOne({ where: { participantId: participant.id } });

    res.render('user/daftar-magang/evaluasi', { 
      participantId: participant.id,
      sudahIsi: !!existing // flag untuk popup
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server.');
  }
});

// Simpan hasil evaluasi
router.post('/save', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const participant = await Participant.findOne({ where: { userId } });
    if (!participant) return res.status(400).send('Participant tidak ditemukan.');

    // Cek agar user tidak bisa submit ulang
    const existing = await Evaluasi.findOne({ where: { participantId: participant.id } });
    if (existing) return res.redirect('/user/evaluasi'); // redirect ke GET route agar popup muncul

    const formData = req.body;

    await Evaluasi.create({
      participantId: participant.id,
      kebijakan_1: formData.kebijakan_1,
      kebijakan_2: formData.kebijakan_2,
      kebijakan_3: formData.kebijakan_3,
      kebijakan_4: formData.kebijakan_4,
      profesional_1: formData.profesional_1,
      profesional_2: formData.profesional_2,
      profesional_3: formData.profesional_3,
      sarana_1: formData.sarana_1,
      sarana_2: formData.sarana_2,
      sarana_3: formData.sarana_3,
      sarana_4: formData.sarana_4,
      sistem_1: formData.sistem_1,
      sistem_2: formData.sistem_2,
      konsultasi_1: formData.konsultasi_1,
    });

    res.redirect('/user/dashboard'); // setelah submit sukses
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat menyimpan evaluasi.');
  }
});

module.exports = router;
