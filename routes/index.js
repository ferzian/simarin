const express = require('express');
const router = express.Router();
const { Visitor } = require('../models');

// Route landing page
router.get('/', async (req, res) => {
  const ip = req.ip;

  // Simpan data kunjungan
  await Visitor.create({ ip });

  res.render('index'); // misal index.ejs kamu
});

module.exports = router;
