const express = require("express");
const router = express.Router();
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Participant, Laporan } = require("../../models");
const { isAuthenticated, isAdmin } = require("../../middleware/authMiddleware");

// GET /admin/sertifikat/:participantId
router.get("/:participantId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const participantId = req.params.participantId;

    // Cari participant + laporan
    const participant = await Participant.findOne({
      where: { id: participantId },
      include: [{ model: Laporan, as: "Laporan" }]
    });

    if (!participant) {
      return res.status(404).send("Peserta tidak ditemukan");
    }

    const namaPeserta = participant.nama;

    // Ambil judul laporan
    let judulLaporan = "Judul Laporan Tidak Ada";
    if (participant.Laporan && participant.Laporan.judul) {
      judulLaporan = participant.Laporan.judul;
    } else if (participant.Laporan && participant.Laporan.fileLaporan) {
      judulLaporan = path.parse(participant.Laporan.fileLaporan).name;
    }

    // Ukuran template sertifikat
    const width = 1123;
    const height = 794;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Load template
    const templatePath = path.join(__dirname, "../../public/images/sertifikat.png");
    const template = await loadImage(templatePath);
    ctx.drawImage(template, 0, 0, width, height);

    // Nama peserta
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(namaPeserta, width / 2, 370);

    // Judul laporan
    ctx.font = "italic 28px Arial";
    ctx.fillText(judulLaporan, width / 2, 430);

    // Tanggal
    const tanggal = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(tanggal, 310, 593);

    // Generate PDF
    const outPath = path.join(
      __dirname,
      `../../public/certificates/${judulLaporan}-${participantId}.pdf`
    );

    const pdfDoc = new PDFDocument({ size: [width, height] });
    const out = fs.createWriteStream(outPath);
    pdfDoc.pipe(out);

    const buffer = canvas.toBuffer("image/png");
    pdfDoc.image(buffer, 0, 0, { width: width, height: height });

    pdfDoc.end();

    out.on("finish", () => {
      res.download(outPath);
    });

  } catch (err) {
    console.error("❌ Error generate sertifikat admin:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
