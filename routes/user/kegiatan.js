const express = require('express');
const router = express.Router();
const { Participant, AktivitasHarian } = require('../../models');
const { getWorkdaysBetween } = require('../../utils/workdays');

// Middleware auth user
function isUser(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Halaman daftar kegiatan (lihat saja)
router.get('/', isUser, async (req, res) => {
  try {
    const participant = await Participant.findOne({ where: { userId: req.session.user.id } });
    if (!participant) return res.send('Participant not found');

    const workdays = getWorkdaysBetween(participant.tanggalMulai, participant.tanggalSelesai);
    const aktivitas = await AktivitasHarian.findAll({ where: { participant_id: participant.id } });

    res.render('user/daftar-magang/kegiatan', { participant, workdays, aktivitas });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Halaman form kegiatan harian (edit)
router.get('/form', isUser, async (req, res) => {
  try {
    const participant = await Participant.findOne({ where: { userId: req.session.user.id } });
    if (!participant) return res.send('Participant not found');

    const workdays = getWorkdaysBetween(participant.tanggalMulai, participant.tanggalSelesai);
    const aktivitas = await AktivitasHarian.findAll({ where: { participant_id: participant.id } });

    res.render('user/daftar-magang/kegiatan-form', { participant, workdays, aktivitas });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Simpan kegiatan harian
router.post('/save', isUser, async (req, res) => {
  try {
    const participant = await Participant.findOne({ where: { userId: req.session.user.id } });
    if (!participant) return res.send('Participant not found');

    const kegiatan = req.body.kegiatan || {};

    for (const [tanggal, desc] of Object.entries(kegiatan)) {
      const trimmedDesc = desc.trim();
      if (trimmedDesc) { // hanya simpan jika ada isi
        await AktivitasHarian.upsert({
          participant_id: participant.id,
          tanggal,
          kegiatan: trimmedDesc
        });
        console.log(`✅ Disimpan: ${tanggal} -> ${trimmedDesc}`);
      }
    }

    res.redirect('/user/kegiatan');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

module.exports = router;
