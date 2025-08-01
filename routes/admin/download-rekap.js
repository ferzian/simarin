const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const moment = require('moment');
const { Visitor, Participant, User } = require('../../models');
const { Op } = require('sequelize');

router.get('/download-rekap', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheetKunjungan = workbook.addWorksheet('Kunjungan');
    const sheetPeserta = workbook.addWorksheet('Peserta Aktif');
    const sheetPendaftar = workbook.addWorksheet('Pendaftar Baru');

    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // === Sheet 1: Kunjungan ===
    const visitors = await Visitor.findAll({
      where: {
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    sheetKunjungan.columns = [
      { header: 'IP Address', key: 'ip', width: 20 },
      { header: 'Tanggal Kunjungan', key: 'createdAt', width: 30 },
    ];

    visitors.forEach(v => {
      sheetKunjungan.addRow({
        ip: v.ip,
        createdAt: moment(v.createdAt).format('YYYY-MM-DD HH:mm:ss')
      });
    });

    // === Sheet 2: Peserta Aktif ===
    const pesertaAktif = await Participant.findAll({
      where: {
        statusSelesai: false,
        tanggalSelesai: { [Op.gte]: moment().startOf('day').toDate() }
      }
    });

    sheetPeserta.columns = [
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 25 },
      { header: 'Asal Institusi', key: 'institusi', width: 30 },
      { header: 'Periode Kegiatan', key: 'periode', width: 30 },
    ];

    pesertaAktif.forEach(p => {
      sheetPeserta.addRow({
        nama: p.nama,
        jenisKelamin: p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        institusi: p.asalInstitusi || '-',
        periode: `${moment(p.tanggalMulai).format('DD-MM-YYYY')} s/d ${moment(p.tanggalSelesai).format('DD-MM-YYYY')}`
      });
    });

    // === Sheet 3: Pendaftar Baru ===
    const pendaftarBaru = await User.findAll({
      where: {
        role: 'user',
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    sheetPendaftar.columns = [
      { header: 'Username', key: 'username', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Nomor HP', key: 'phone', width: 20 },
      { header: 'Tanggal Lahir', key: 'dob', width: 20 },
      { header: 'Tanggal Daftar', key: 'createdAt', width: 25 },
    ];

    pendaftarBaru.forEach(u => {
      sheetPendaftar.addRow({
        username: u.username,
        email: u.email || '-',
        phone: u.phone || '-',
        dob: u.dob ? moment(u.dob).format('DD-MM-YYYY') : '-',
        createdAt: moment(u.createdAt).format('DD-MM-YYYY HH:mm')
      });
    });


    // Download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap_bulanan_simarin.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Gagal generate rekap Excel:', err);
    res.status(500).send('Gagal membuat file Excel');
  }
});

module.exports = router;
