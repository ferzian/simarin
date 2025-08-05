const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

// GET - Halaman approval akun
router.get('/approval-akun', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({ where: { role: 'user', approved: false } });
    const pendingParticipants = await Participant.findAll({
      where: { statusSelesai: false },
      include: [{ model: User }],
    });

    res.render('admin/approval-akun', {
      pendingUsers,
      pendingParticipants,
      user: req.session.user
    });
  } catch (err) {
    console.error('❌ Gagal ambil data approval akun:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
