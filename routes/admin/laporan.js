const express = require('express');
const router = express.Router();
const { Laporan, Participant } = require('../../models');
const path = require('path');
const fs = require('fs');

// Middleware: cek login role admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET semua laporan
router.get('/', isAdmin, async (req, res) => {
  const limit = 10; // maksimal 10 data per halaman
  const page = parseInt(req.query.page) || 1; // halaman aktif
  const offset = (page - 1) * limit;

  // Ambil data laporan + total count
  const { count, rows: laporan } = await Laporan.findAndCountAll({
    include: [{ model: Participant, as: "participant", attributes: ['nama'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const pendingCount = await Laporan.count({ where: { status: 'pending' } });

  // Hitung total halaman
  const totalPages = Math.ceil(count / limit);

  res.render('admin/laporan', {
    laporan,
    pendingCount,
    currentPage: page,
    totalPages
  });
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
