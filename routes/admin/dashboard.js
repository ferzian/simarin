// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { User, Visitor } = require('../../models');
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

  res.render('admin/dashboard', {
    pendingUsers,
    visitCount
  });
});

module.exports = router;
