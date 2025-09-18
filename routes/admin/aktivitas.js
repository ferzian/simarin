const express = require('express');
const router = express.Router();
const { User, Participant, Laporan } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/aktivitas', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingCount = await Laporan.count({ where: { status: 'pending' } });
        const participants = await Participant.findAll({
            include: [{ model: User, where: { role: 'user', approved: true } }],
        }).catch(() => []);

        res.render('admin/aktivitas', {
            participants: participants?.map((p) => ({
                nama: p.nama,
                jenisKelamin: p.jenisKelamin,
                prodi: p.prodi,
                kegiatan: p.kegiatan,
                instansi: p.instansi,
                lokasi: p.lokasi,
                tanggalMulai: p.tanggalMulai,
                tanggalSelesai: p.tanggalSelesai,
            })) || [],
            user: req.session.user,
            pendingCount
        });
    } catch (err) {
        console.error('❌ Gagal ambil data peserta:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
