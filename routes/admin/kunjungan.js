const express = require('express');
const router = express.Router();
const { Visitor } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/kunjungan', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const visitors = await Visitor.findAll({
            order: [['createdAt', 'ASC']], // urutkan biar rapi
            raw: true
        });

        const formatDate = (dateStr) =>
            new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

        res.render('admin/kunjungan', {
            visitors: visitors.map((v) => ({
                id: v.id,
                ip: v.ip,
                createdAt: v.createdAt,         // 👉 penting buat chart
                visitedAt: formatDate(v.createdAt), // 👉 buat tabel
            })),
            user: req.session.user
        });
    } catch (err) {
        console.error('❌ Gagal ambil data pengunjung:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
