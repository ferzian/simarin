const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
const { Survey } = require('../../models');

router.get('/skm', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingUsers = await User.findAll({
            where: { role: 'user', approved: false },
        });

        const pendingParticipants = await Participant.findAll({
            where: { statusSelesai: false },
            include: [{ model: User }]
        });

        const surveys = await Survey.findAll();
        res.render('admin/skm', {
            pendingUsers,
            pendingParticipants,
            skmData: JSON.stringify(surveys),
        });
    } catch (err) {
        console.error('❌ Gagal ambil data SKM:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/skm', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const surveys = await Survey.findAll({ order: [['createdAt', 'DESC']] });

    res.render('admin/skm', {
      skmData: JSON.stringify(surveys),
    });
  } catch (err) {
    console.error('❌ Gagal ambil data SKM:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
