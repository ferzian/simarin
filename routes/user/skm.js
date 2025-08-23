const express = require('express');
const router = express.Router();
const { Laporan } = require('../../models'); // ✅ ambil model laporan

// Middleware: pastikan user login & role user
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// 📌 GET halaman SKM (alur setelah magang)
router.get('/skm', isUser, async (req, res) => {
  try {
    // cek apakah user sudah upload laporan
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }
    });

    // default status
    let statusLaporan = laporan ? laporan.status : 'belum_upload';

    res.render('user/daftar-magang/skm', {
      username: req.session.user.username,
      statusLaporan
    });
  } catch (err) {
    console.error('❌ Error load SKM:', err);
    res.render('user/daftar-magang/skm', {
      username: req.session.user.username,
      statusLaporan: 'error'
    });
  }
});

module.exports = router;
