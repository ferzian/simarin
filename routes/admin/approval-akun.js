const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
// const { sendApprovalEmail, sendRejectionEmail } = require('../../utils/sendEmail');

router.get('/approval-akun', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({ where: { role: 'user', approved: false } });
    const pendingParticipants = await Participant.findAll({
      where: { statusSelesai: false },
      include: [{ model: User }]
    });

    res.render('admin/approval-akun', {
      pendingUsers,
      pendingParticipants,
      user: req.session.user // kalau view-nya butuh
    });
  } catch (err) {
    console.error('❌ Gagal ambil data approval akun:', err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
