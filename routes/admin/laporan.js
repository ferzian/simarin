const express = require('express');
const router = express.Router();
const { Laporan, User } = require('../../models');

// Middleware: cek login role admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET semua laporan
router.get('/laporan', isAdmin, async (req, res) => {
  const laporan = await Laporan.findAll({ include: [{ model: User, as: 'user' }] });
  res.render('admin/laporan/index', { laporan });
});

// POST approve
router.post('/laporan/:id/approve', isAdmin, async (req, res) => {
  await Laporan.update({ status: 'approved' }, { where: { id: req.params.id } });
  res.redirect('/admin/laporan');
});

// POST reject
router.post('/laporan/:id/reject', isAdmin, async (req, res) => {
  await Laporan.update({ status: 'rejected' }, { where: { id: req.params.id } });
  res.redirect('/admin/laporan');
});

module.exports = router;
