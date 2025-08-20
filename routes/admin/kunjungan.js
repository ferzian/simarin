const express = require('express');
const router = express.Router();
const { User, Visitor } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/kunjungan', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const visitors = await Visitor.findAll({
        });

        const formatDate = (dateStr) =>
            new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });


        res.render('admin/kunjungan', {
            visitors: visitors.map((v) => ({
                ip: v.ip,
                visitedAt: formatDate(v.visitedAt),
            })),
            user: req.session.user
        });
    } catch (err) {
        console.error('❌ Gagal ambil data pengunjung:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
