const express = require('express');
const router = express.Router();
const { sequelize, Participant, Survey, Visitor } = require('../../models');
const { Op, fn, col } = require('sequelize');
const moment = require('moment');

// GET /admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // === Variabel waktu ===
    const monthStart = moment().startOf('month').toDate();
    const today = moment().startOf('day').toDate();
    const sevenDaysLater = moment().add(7, 'days').endOf('day').toDate();

    // === Pendaftar baru bulan ini ===
    const newRegistrantsCount = await Participant.count({
      where: { createdAt: { [Op.gte]: monthStart } }
    });

    // === Kunjungan bulan ini ===
    const visitCount = await Visitor.count({
      where: { createdAt: { [Op.gte]: monthStart } }
    });

    // === Peserta aktif hari ini ===
    const aktifCount = await Participant.count({
      where: {
        tanggalMulai: { [Op.lte]: today },
        tanggalSelesai: { [Op.gte]: today }
      }
    });

    // === Peserta aktif per lokasi ===
    const lokasiCounts = await Participant.findAll({
      attributes: ['lokasi', [fn('COUNT', col('id')), 'count']],
      where: {
        tanggalMulai: { [Op.lte]: today },
        tanggalSelesai: { [Op.gte]: today }
      },
      group: ['lokasi']
    });

    const lokasiData = { Sempur: 0, Depok: 0, Cibalagung: 0, Cijeruk: 0 };
    lokasiCounts.forEach(row => {
      const lokasi = row.get('lokasi');
      const count = Number(row.get('count')) || 0;
      if (lokasiData.hasOwnProperty(lokasi)) {
        lokasiData[lokasi] = count;
      }
    });

    // === Kegiatan terdekat selesai (7 hari ke depan) ===
    const upcomingEndDate = await Participant.findAll({
      where: {
        tanggalSelesai: { [Op.between]: [today, sevenDaysLater] },
        statusSelesai: false
      },
      order: [['tanggalSelesai', 'ASC']],
      limit: 5
    });

    // === Render ke view ===
    res.render('admin/dashboard', {
      visitCount,
      aktifCount,
      newRegistrantsCount,
      lokasiData,
      upcomingEndDate,
      moment
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
