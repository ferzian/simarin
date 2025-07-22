// routes/admin/download-visitor.js
const express = require('express');
const router = express.Router();
const { Visitor } = require('../../models');
const { Parser } = require('json2csv');

router.get('/download-visitors', async (req, res) => {
  const visitors = await Visitor.findAll();

  const jsonVisitors = visitors.map(v => ({
    ip: v.ip,
    tanggal: v.createdAt
  }));

  const parser = new Parser({ fields: ['ip', 'tanggal'] });
  const csv = parser.parse(jsonVisitors);

  res.header('Content-Type', 'text/csv');
  res.attachment('rekap_kunjungan.csv');
  res.send(csv);
});

module.exports = router;
