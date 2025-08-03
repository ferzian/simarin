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

router.post('/approve-participant/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const participant = await Participant.findByPk(id);
        if (!participant) {
            return res.status(404).send('Peserta tidak ditemukan');
        }

        // Diapprove -> statusSelesai true (atau kamu bisa tambah field baru 'approved' kalau perlu)
        await participant.update({ statusSelesai: true });

        res.redirect('/admin/approval-peserta');
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal meng-approve peserta');
    }
});

router.post('/reject-participant/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const participant = await Participant.findByPk(id);
        if (!participant) {
            return res.status(404).send('Peserta tidak ditemukan');
        }
        await participant.destroy();
        res.redirect('/admin/approval-peserta');
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal menolak peserta');
    }
});

module.exports = router;
