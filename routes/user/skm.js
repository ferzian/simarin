const express = require('express');
const router = express.Router();
const { Skm } = require('../../models');

// Middleware: pastikan user login & role user
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/skm', isUser,async (req, res) => {
  const existing = await Skm.findOne({ where: { userId:req.session.user.id } });
  console.log(req.session.user)
  console.log(existing)
  res.render('user/daftar-magang/skm', {
    isRegistered:existing,
    username: req.session.user.username
  });
});

// 💡 Route POST: Proses penyimpanan data magang
router.post(
    '/user/skm',
    async (req, res) => {
      try {
        const userId = req.session.user.id;
        const {
            JenisLayanan,
            rating,
            komentar,


        } = req.body;
  
        // 💡 Validasi nomor telepon unik
        const existing = await Skm.findOne({ where: { telepon } });
        if (existing) {
          return res.render('user/daftar-magang/index', {
            username: req.session.user?.username || 'Pengguna',
            error: 'Nomor telepon sudah digunakan.',
            success: false,
          });
        }
  
        // 💾 Simpan data ke database
        await Skm.create({
          JenisLayanan,
          rating,
          komentar,
  
        });
  
        // ✅ Redirect dengan query success
        return res.redirect('/user/daftar-magang?success=true');
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


module.exports = router;
