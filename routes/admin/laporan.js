const express = require('express');
const router = express.Router();
const { Laporan, Participant } = require('../../models');

// Middleware: cek login role admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET semua laporan
router.get('/', isAdmin, async (req, res) => {
  const laporan = await Laporan.findAll({
    include: [
      { model: Participant, attributes: ['nama'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.render('admin/laporan', { laporan });
});

// POST approve
router.post('/:id/approve', isAdmin, async (req, res) => {
  await Laporan.update({ status: 'approved' }, { where: { id: req.params.id } });
  res.redirect('/admin/laporan');
});

// POST reject
router.post('/:id/reject', isAdmin, async (req, res) => {
  await Laporan.update({ status: 'rejected' }, { where: { id: req.params.id } });
  res.redirect('/admin/laporan');
});


module.exports = router;
