const express = require('express');
const router = express.Router();
const { User, Participant } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
const ExcelJS = require('exceljs');

router.get('/data-peserta', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participants = await Participant.findAll({
      include: [
        {
          model: User,
          where: { role: 'user' }, // hanya user yang approved
        },
      ],
    });

    const formatDate = (dateStr) =>
      new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });


    res.render('admin/data-peserta', {
      participants: participants.map((p) => ({
        nama: p.nama,
        nisNpm: p.nisNpm,
        jenisKelamin: p.jenisKelamin,
        telepon: p.telepon,
        email: p.User.email,
        alamat: p.alamat,
        jenjang: p.jenjang,
        instansi: p.instansi,
        prodi: p.prodi,
        kegiatan: p.kegiatan,
        lokasi: p.lokasi,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
        pasFoto: p.pasFoto, 
        suratSehat: p.suratSehat,
      })),
      user: req.session.user
    });

  } catch (err) {
    console.error('❌ Gagal ambil data peserta:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/data-peserta/download', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participants = await Participant.findAll({
      include: [{ model: User, where: { role: 'user' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Peserta');

    // Judul
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Laporan Data Peserta SIMARIN';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Periode (kalau mau ambil dari query filter)
    worksheet.mergeCells('A2:L2');
    const periodeCell = worksheet.getCell('A2');
    periodeCell.value = 'Periode: Semua Data';
    periodeCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Header
    const headers = [
      "Nama Lengkap",
      "NIS/NPM",
      "Jenis Kelamin",
      "No. Telepon",
      "Alamat Domisili",
      "Jenjang Pendidikan",
      "Asal Instansi",
      "Jurusan",
      "Jenis Kegiatan",
      "Lokasi Kegiatan",
      "Tanggal Mulai",
      "Tanggal Selesai",
    ];
    worksheet.addRow([]);
    worksheet.addRow(headers);

    // Styling header
    worksheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E5E5' }, // abu-abu muda
      };
    });

    // Data
    participants.forEach((p) => {
      worksheet.addRow([
        p.nama,
        p.nisNpm,
        p.jenisKelamin,
        p.telepon,
        p.alamat,
        p.jenjang,
        p.instansi,
        p.prodi,
        p.kegiatan,
        p.lokasi,
        new Date(p.tanggalMulai).toLocaleDateString('id-ID'),
        new Date(p.tanggalSelesai).toLocaleDateString('id-ID'),
      ]);
    });

    // Border untuk semua data
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    // Lebar kolom otomatis
    worksheet.columns.forEach((col) => {
      col.width = col.header ? col.header.length + 5 : 20;
    });

    // Kirim file Excel ke client
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="data_peserta_simarin.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Gagal generate Excel:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
