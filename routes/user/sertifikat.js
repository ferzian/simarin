const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const { Laporan, User } = require('../../models');

// Generate Sertifikat PDF
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    // Ambil user & laporan dari DB
    const user = await User.findByPk(req.session.user.id);
    const laporan = await Laporan.findOne({
      where: { userId: req.session.user.id }
    });

    if (!laporan || laporan.status !== 'approved') {
      return res.status(403).send('Sertifikat belum bisa diunduh (laporan belum diapprove)');
    }

    // Buat PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape'
    });

    // Nama file download
    res.setHeader('Content-Disposition', 'attachment; filename="sertifikat.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Tambahkan background sertifikat
    const bgPath = path.join(__dirname, '../../public/images/sertifikat.png');
    doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });

    // Tulis Nama Peserta
    doc.fontSize(36)
      .fillColor('#000000')
      .font('Times-Bold')
      .text(user.nama, 0, 300, {
        align: 'center'
      });

    // Tulis Judul Laporan
    doc.fontSize(20)
      .fillColor('#333333')
      .font('Times-Roman')
      .text(`"${laporan.judul}"`, 0, 370, {
        align: 'center'
      });

    // Tulis Tanggal
    const tanggal = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    doc.fontSize(16)
      .text(`Dikeluarkan pada: ${tanggal}`, 0, 450, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal generate sertifikat');
  }
});

module.exports = router;
