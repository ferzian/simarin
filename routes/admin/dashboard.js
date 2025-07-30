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

  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const visitCount = await Visitor.count({
    where: {
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
    visitCount,
    aktifCount, // ✅ kirim ke view
    user: req.session.user
  });
});

module.exports = router;
