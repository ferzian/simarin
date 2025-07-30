const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/skm', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingUsers = await User.findAll({
            where: { role: 'user', approved: false },
        });

        const pendingParticipants = await Participant.findAll({
            where: { statusSelesai: false },
            include: [{ model: User }]
        });
        res.render('admin/skm', {
            pendingUsers,
            pendingParticipants
        });
    } catch (err) {
        console.error('❌ Gagal ambil data approval akun:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
