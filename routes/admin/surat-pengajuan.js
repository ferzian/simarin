const express = require('express');
const router = express.Router();
const { SuratPermohonan, User, Laporan } = require('../../models'); // pastikan model sudah ada
const path = require('path');

// Middleware admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
}

// GET semua surat permohonan
router.get('/', isAdmin, async (req, res) => {
  const limit = 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  const { count, rows: surat } = await SuratPermohonan.findAndCountAll({
    include: [{ model: User, as: 'user', attributes: ['username', 'instansi'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  // === Surat Permohonan Pending ===
  const pendingCount = await SuratPermohonan.count({ where: { status: 'pending' } });

  // === Laporan Pending ===
  const laporanCount = await Laporan.count({
    where: { status: 'pending' }
  });
  const totalPages = Math.ceil(count / limit);

  res.render('admin/surat-pengajuan', {
    surat,
    pendingCount,
    laporanCount,
    currentPage: page,
    totalPages,
  });
});

// POST approve
router.post('/:id/approve', isAdmin, async (req, res) => {
  await SuratPermohonan.update({ status: 'approved' }, { where: { id: req.params.id } });
  res.redirect('/admin/surat-pengajuan');
});

// POST reject
router.post('/:id/reject', isAdmin, async (req, res) => {
  await SuratPermohonan.update({ status: 'rejected' }, { where: { id: req.params.id } });
  res.redirect('/admin/surat-pengajuan');
});

module.exports = router;
