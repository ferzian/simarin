const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
const { sendApprovalEmail, sendRejectionEmail } = require('../../utils/sendEmail');

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

// POST - Approve akun
router.post('/approve-akun/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('User tidak ditemukan');

    user.approved = true;
    await user.save();

    await sendApprovalEmail(user);

    res.redirect('/admin/approval-akun?status=approved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menyetujui akun');
  }
});

// POST - Reject akun
router.post('/reject-akun/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('User tidak ditemukan');

    await sendRejectionEmail(user);

    await user.destroy();
    res.redirect('/admin/approval-akun?status=rejected');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menolak akun');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
