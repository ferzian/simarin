const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/approval-peserta', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingUsers = await User.findAll({
            where: { role: 'user', approved: false },
        });

        const pendingParticipants = await Participant.findAll({
            where: {
                statusSelesai: false
            },
            include: [{ model: User }]
        });

        res.render('admin/approval-peserta', {
            pendingParticipants,
            user: req.session.user,
            pendingUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal mengambil data peserta');
    }
});

module.exports = router;
