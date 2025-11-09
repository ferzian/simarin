const express = require('express');
const router = express.Router();
const { Laporan, UploadSusan, Participant } = require('../../models');

// Middleware auth
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// ======================
// 🧭 GET - Halaman SKM
// ======================
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Ambil data laporan
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id },
      include: [{ model: Participant, as: "participant" }]
    });

    // Ambil data upload Susan
    const susan = await UploadSusan.findOne({
      where: { userId: req.session.user.id }
    });

    // Tentukan status laporan
    let statusLaporan = 'belum_upload';
    if (laporan) {
      if (laporan.status === 'approved') statusLaporan = 'approved';
      else if (laporan.status === 'rejected') statusLaporan = 'rejected';
      else statusLaporan = 'menunggu_approval';
    }

    // Tentukan status upload Susan
    let statusSusan = 'belum_upload';
    if (susan) {
      if (susan.status === 'approved') statusSusan = 'approved';
      else if (susan.status === 'pending') statusSusan = 'menunggu_approval';
    }

    console.log('Status laporan:', statusLaporan, '| Status Susan:', statusSusan);

    res.render('user/daftar-magang/skm', {
      title: 'Alur Selesai Magang - SKM',
      statusLaporan,
      statusUploadSusan: statusSusan, // ✅ ubah nama supaya cocok dengan EJS
      user: req.user
    });
    

  } catch (error) {
    console.error('Error GET SKM:', error);
    res.status(500).send('Server Error');
  }
});

// ======================
// 🔍 CEK STATUS (Auto-refresh)
// ======================
router.get('/check-status', isAuthenticated, async (req, res) => {
  try {
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id },
      include: [{ model: Participant, as: "participant" }]
    });

    let status = 'belum_upload';
    if (laporan) {
      status = laporan.status === 'approved' ? 'approved'
        : laporan.status === 'rejected' ? 'rejected'
        : 'menunggu_approval';
    }

    res.json({ status });
  } catch (error) {
    console.error(error);
    res.json({ status: 'belum_upload' });
  }
});

// ======================
// ✅ ADMIN - Approve laporan
// ======================
router.post('/approve/:laporanId', async (req, res) => {
  try {
    await Laporan.update(
      { status: 'approved', tanggalApproval: new Date() },
      { where: { id: req.params.laporanId } }
    );
    res.json({ success: true, message: 'Laporan disetujui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal approve laporan' });
  }
});

// ======================
// 🧾 DOWNLOAD SERTIFIKAT
// ======================
router.get('/download-sertifikat', isAuthenticated, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/sertifikat', `sertifikat-${req.user.id}.pdf`);
    res.download(filePath, `sertifikat-${req.user.id}.pdf`, (err) => {
      if (err) {
        console.error("Gagal download:", err);
        return res.status(500).send("Sertifikat belum tersedia.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mendownload sertifikat.');
  }
});

module.exports = router;
