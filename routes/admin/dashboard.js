// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { User, Visitor, Participant } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

router.get('/dashboard', async (req, res) => {
  const pendingUsers = await User.findAll({
    where: { role: 'user', approved: false }
  });

  const pendingParticipants = await Participant.findAll({
    where: { statusSelesai: false },
  });

  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const visitCount = await Visitor.count({
    where: {
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth]
      }
    }
  });

  // Hitung pendaftar baru bulan ini (tanpa filter approved)
  const newRegistrantsCount = await User.count({
    where: {
      role: 'user',
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth]
      }
    }
  });

  const today = moment().startOf('day').toDate(); // tanggal hari ini tanpa jam
  const aktifCount = await Participant.count({
    where: {
      statusSelesai: false,
      tanggalSelesai: {
        [Op.gte]: today
      }
    }
  });

  res.render('admin/dashboard', {
    pendingUsers,
    pendingParticipants,
    visitCount,
    aktifCount,
    newRegistrantsCount,
    user: req.session.user
  });
});

module.exports = router;
