const express = require('express');
const router = express.Router();
const { Participant } = require('../../models');
const { Op, fn, col } = require('sequelize');
const moment = require('moment');

// GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // batas awal bulan ini (untuk kartu "pendaftar baru")
    const monthStart = moment().startOf('month').toDate();

    // kartu-kartu atas (silakan sesuaikan definisinya)
    const visitCount = await Participant.count(); // atau hitung dari model Visitor jika ada
    const newRegistrantsCount = await Participant.count({
      where: { createdAt: { [Op.gte]: monthStart } }
    });

    const today = new Date();

    const aktifCount = await Participant.count({
      where: {
        tanggalMulai: { [Op.lte]: today },
        tanggalSelesai: { [Op.gte]: today }
      }
    });

    const lokasiCounts = await Participant.findAll({
      attributes: [
        'lokasi',
        [fn('COUNT', col('id'))
          , 'count']
      ],
      where: {
        tanggalMulai: { [Op.lte]: today },
        tanggalSelesai: { [Op.gte]: today }
      },
      group: ['lokasi']
    });

    // Normalisasi ke 4 lokasi yang kamu mau
    const lokasiData = { Sempur: 0, Depok: 0, Cibalagung: 0, Cijeruk: 0 };
    lokasiCounts.forEach(row => {
      const lokasi = row.get('lokasi');
      const count = Number(row.get('count')) || 0;
      if (lokasiData.hasOwnProperty(lokasi)) {
        lokasiData[lokasi] = count;
      }
    });

    res.render('admin/dashboard', {
      visitCount,
      aktifCount,
      newRegistrantsCount,
      lokasiData,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
