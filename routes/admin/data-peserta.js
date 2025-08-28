const express = require('express');
const router = express.Router();
const { User, Participant, Laporan } = require('../../models');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
const ExcelJS = require('exceljs');
const { Op } = require("sequelize");

router.get('/data-peserta', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingCount = await Laporan.count({ where: { status: 'pending' } });
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
      user: req.session.user,
      pendingCount
    });

  } catch (err) {
    console.error('❌ Gagal ambil data peserta:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/data-peserta/download', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { start, end, type, lokasi } = req.query;
    const whereClause = {};

    // Filter tanggal dengan overlap
    if (start && end) {
      whereClause[Op.and] = [
        { tanggalMulai: { [Op.lte]: end } },
        { tanggalSelesai: { [Op.gte]: start } }
      ];
    }

    if (type) whereClause.kegiatan = type;
    if (lokasi) whereClause.lokasi = lokasi;

    const participants = await Participant.findAll({
      where: whereClause,
      include: [{ model: User, where: { role: 'user' } }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Peserta');

    // Hitung total kolom header
    const headers = [
      "Nama Lengkap", "Nomor Induk Siswa/Mahasiswa", "Jenis Kelamin", "No. Telepon", "Alamat Domisili",
      "Jenjang Pendidikan", "Asal Instansi", "Jurusan", "Jenis Kegiatan",
      "Lokasi Kegiatan", "Tanggal Mulai", "Tanggal Selesai"
    ];

    const totalColumns = headers.length;
    const lastColLetter = worksheet.getColumn(totalColumns).letter;

    // === Judul ===
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Laporan Data Peserta SIMARIN';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // === Periode ===
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const periodeCell = worksheet.getCell('A2');

    const formatDateIndo = (dateStr) =>
      new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    if (start && end) {
      periodeCell.value = `Periode: ${formatDateIndo(start)} s/d ${formatDateIndo(end)}`;
    } else if (start) {
      periodeCell.value = `Periode: sejak ${formatDateIndo(start)}`;
    } else if (end) {
      periodeCell.value = `Periode: sampai ${formatDateIndo(end)}`;
    } else {
      periodeCell.value = 'Periode: Semua Data';
    }

    periodeCell.font = { italic: true, size: 12 };
    periodeCell.alignment = { vertical: 'middle', horizontal: 'center' };


    // === Kosongkan 1 row sebelum header ===
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
