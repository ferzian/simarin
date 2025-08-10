const express = require('express');
const router = express.Router();
const { Participant } = require('../../models');

// Middleware: pastikan user login & role user
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET dashboard user
router.get('/dashboard', isUser,async (req, res) => {
  const existing = await Participant.findOne({ where: { userId:req.session.user.id } });
  console.log(req.session.user)
  console.log(existing)
  res.render('user/user-dashboard', {
    isRegistered:existing,
    username: req.session.user.username
  });
});

router.get('/skm', isUser,async (req, res) => {
  const existing = await Participant.findOne({ where: { userId:req.session.user.id } });
  console.log(req.session.user)
  console.log(existing)
  res.render('user/daftar-magang/skm', {
    isRegistered:existing,
    username: req.session.user.username
  });
});

// GET halaman permintaan sertifikat
router.get('/daftar-magang/sertifikat', isUser, (req, res) => {
  res.render('user/daftar-magang/sertifikat', {
    username: req.session.user.username
  });
});

// GET halaman SKM
const { PendaftaranMagang } = require('../../models'); // sesuaikan dengan nama model kamu

router.get('/skm', isUser, async (req, res) => {
    try {
        const pendaftaran = await PendaftaranMagang.findOne({
            where: { userId: req.session.user.id } // sesuaikan nama kolom
        });

        if (!pendaftaran) {
            return res.render('user/user-dashboard', {
                username: req.session.user.username,
                error: 'Silakan daftar magang terlebih dahulu untuk mengakses SKM'
            });
        }

        res.render('user/skm', {
            username: req.session.user.username
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan server');
    }
});


// POST logout (bisa juga dipindah ke routes/auth.js kalau ingin pisah total)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/user/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;
