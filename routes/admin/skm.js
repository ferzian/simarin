const express = require('express');
const router = express.Router();
const { Survey } = require('../../models');
const ExcelJS = require('exceljs');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');
const { Op } = require('sequelize');


router.get('/skm', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const surveys = await Survey.findAll({ order: [['createdAt', 'DESC']] });

    res.render('admin/skm', {
      skmData: JSON.stringify(surveys),
    });
  } catch (err) {
    console.error('❌ Gagal ambil data SKM:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/skm/export', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;

    let whereClause = {};

    // filter tanggal
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.date = { [Op.lte]: new Date(endDate) };
    }

    // filter search
    if (search) {
      whereClause[Op.or] = [
        { school: { [Op.like]: `%${search}%` } },  
        { location: { [Op.like]: `%${search}%` } },
        { gender: { [Op.like]: `%${search}%` } }
      ];
    }

    const surveys = await Survey.findAll({
      where: whereClause,
      order: [['date', 'ASC']]
    });

    if (!surveys.length) {
      return res.status(400).send('Tidak ada data SKM untuk filter tersebut.');
    }

    // Buat workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('IKM');

    // Header laporan
    sheet.mergeCells('A1:K1');
    sheet.getCell('A1').value = 'PENGOLAHAN INDEKS KEPUASAN MASYARAKAT PER RESPONDEN';
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('A1').font = { bold: true, size: 14 };

    // Informasi detail
    sheet.mergeCells('A3:K3');
    sheet.getCell('A3').value = `Tanggal Periode: ${startDate || '-'} s/d ${endDate || '-'}`;

    sheet.mergeCells('A4:K4');
    sheet.getCell('A4').value = `Unit Pelayanan : PPID BRPBATP`;

    sheet.mergeCells('A5:K5');
    sheet.getCell('A5').value = `Alamat         : JL. SEMPUR NO.1 BOGOR 16129`;

    sheet.mergeCells('A6:K6');
    sheet.getCell('A6').value = `Tlp/Fax.       : (0251) 8313200/8327890`;

    // Header tabel
    sheet.addRow([]);
    let headerRow = ['NO. RESP'];
    for (let i = 1; i <= 9; i++) headerRow.push(`Q${i}`);
    let tableHeader = sheet.addRow(headerRow);

    tableHeader.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Data responden
    surveys.forEach((s, idx) => {
      let row = sheet.addRow([
        idx + 1,
        s.q1, s.q2, s.q3, s.q4, s.q5, s.q6, s.q7, s.q8, s.q9
      ]);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Baris perhitungan
    const startDataRow = 9;
    const lastDataRow = sheet.lastRow.number;

    let nilaiRow = ['Nilai/Unsur'];
    for (let i = 2; i <= 10; i++) {
      nilaiRow.push({ formula: `SUM(${sheet.getColumn(i).letter}${startDataRow}:${sheet.getColumn(i).letter}${lastDataRow})` });
    }
    const totalRow = sheet.addRow(nilaiRow);

    let nrrRow = ['NRR/Unsur'];
    for (let i = 2; i <= 10; i++) {
      nrrRow.push({ formula: `${sheet.getColumn(i).letter}${lastDataRow + 1}/${surveys.length}` });
    }
    const nrrCalcRow = sheet.addRow(nrrRow);

    let nnrRow = ['NNR Tertimbang/Unsur * 0.111'];
    for (let i = 2; i <= 10; i++) {
      nnrRow.push({ formula: `${sheet.getColumn(i).letter}${lastDataRow + 2}*0.111` });
    }
    const nnrCalcRow = sheet.addRow(nnrRow);

    [totalRow, nrrCalcRow, nnrCalcRow].forEach(row => {
      row.eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    sheet.getCell(`L${lastDataRow + 3}`).value = 'Total NNR Tertimbang';
    sheet.getCell(`M${lastDataRow + 3}`).value = { formula: `SUM(B${lastDataRow + 3}:J${lastDataRow + 3})` };
    sheet.getCell(`L${lastDataRow + 3}`).font = { bold: true };

    sheet.getCell(`L${lastDataRow + 4}`).value = 'IKM Unit Pelayanan * 25';
    sheet.getCell(`M${lastDataRow + 4}`).value = { formula: `M${lastDataRow + 3}*25` };
    sheet.getCell(`L${lastDataRow + 4}`).font = { bold: true };
    sheet.getCell(`M${lastDataRow + 4}`).font = { bold: true };

    sheet.columns.forEach(col => {
      col.width = 15;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap_skm.xlsx');
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Gagal export SKM:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
