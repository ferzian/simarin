const { Visitor } = require('../models');
const { Op } = require('sequelize');

module.exports = async function visitorLogger(req, res, next) { 
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const alreadyVisited = await Visitor.findOne({
      where: {
        ip,
        createdAt: {
          [Op.between]: [todayStart, todayEnd]
        }
      }
    });

    if (!alreadyVisited) {
      await Visitor.create({
        ip,
        visitedAt: new Date()
      });
    }
  } catch (err) {
    console.error('Gagal mencatat visitor:', err.message);
  }
  next();
};
