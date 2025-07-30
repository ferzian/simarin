// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { User, Visitor, Participant } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [pendingUsers, pendingParticipants, visitCount, newRegistrantsCount, aktifCount] = await Promise.all([
      User.findAll({ where: { role: 'user', approved: false } }),
      Participant.findAll({ where: { statusSelesai: false } }),
      Visitor.count({
        where: {
          createdAt: {
            [Op.between]: [moment().startOf('month').toDate(), moment().endOf('month').toDate()]
          }
        }
      }),
      User.count({
        where: {
          role: 'user',
          createdAt: {
            [Op.between]: [moment().startOf('month').toDate(), moment().endOf('month').toDate()]
          }
        }
      }),
      Participant.count({
        where: {
          statusSelesai: false,
          tanggalSelesai: { [Op.gte]: moment().startOf('day').toDate() }
        }
      })
    ]);

    res.render('admin/dashboard', {
      pendingUsers,
      pendingParticipants,
      visitCount,
      aktifCount,
      newRegistrantsCount,
      user: req.session.user
    });
  } catch (err) {
    console.error('❌ Error dashboard:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
