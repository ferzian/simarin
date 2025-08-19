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

router.get('/user/daftar-magang/skm', isUser,async (req, res) => {
  const existing = await Skm.findOne({ where: { userId:req.session.user.id } });
  console.log(req.session.user)
  console.log(existing)
  res.render('user/daftar-magang/skm', {
    isRegistered:existing,
    username: req.session.user.username
  });
});

// 💡 Route POST: Proses penyimpanan data magang
router.post('/skm', isUser, async (req, res) => {
      try {
        const userId = req.session.user.id;
        const {
            nama,
            jenis_kelamin,
            usia,
            pendidikan,
            pekerjaan,
            penilaian_1,
            penilaian_2,
            penilaian_3,
            penilaian_4,
            penilaian_5,
            penilaian_6,
            penilaian_7,
            penilaian_8,
            penilaian_9,
            nilai_total,
            kritik,
            saran,

        } = req.body;
  
  console.log('Data dari form:', req.body);

        // 💾 Simpan data ke database
        await Skm.create({
          userId: req.session.user.id,
          nama,
          jenis_kelamin,
          usia,
          pendidikan,
          pekerjaan,
          penilaian_1,
          penilaian_2,
          penilaian_3,
          penilaian_4,
          penilaian_5,
          penilaian_6,
          penilaian_7,
          penilaian_8,
          penilaian_9,
          nilai_total,
          kritik,
          saran,
  
        });
  
        // ✅ Redirect dengan query success
        return res.redirect('/user/laporan');
      } catch (err) {
        console.error('❌ Gagal menyimpan data peserta:', err);
  
        // ❌ Render kembali halaman dengan error (✅ diperbaiki di sini)
        return res.render('user/daftar-magang/skm', {
          username: req.session.user?.username || 'Pengguna',
          error: 'Terjadi kesalahan saat menyimpan data.',
          success: false,
        });
      }
    }
  );


module.exports = router;
