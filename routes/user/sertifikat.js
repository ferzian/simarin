const express = require("express");
const router = express.Router();
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Participant, Laporan } = require("../../models/"); // sesuaikan model Sequelize

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Ambil data laporan + participant dari DB
    const laporan = await Laporan.findOne({
      where: { userId: id },
      include: [{ model: Participant, as: "participant" }]
    });

    if (!laporan) {
      return res.status(404).send('Data tidak ditemukan');
    }

    const namaPeserta = laporan.participant.nama;
    // ✅ ambil nama file tanpa ekstensi
    // Ambil judul laporan
let judulLaporan = "Judul Laporan Tidak Ada";
if (laporan.judul) {
  judulLaporan = laporan.judul;
} else if (laporan.fileLaporan) {
  judulLaporan = path.parse(laporan.fileLaporan).name;
}


    // Ukuran template sertifikat (sesuaikan)
    const width = 1123;
    const height = 794; 
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Load template
    const templatePath = path.join(__dirname, "../../public/images/sertifikat.png");
    const template = await loadImage(templatePath);

    // Gambar template ke canvas
    ctx.drawImage(template, 0, 0, width, height);

    // Tambahkan teks (nama peserta)
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(namaPeserta, width / 2, 370);
    

    // Tambahkan teks (judul laporan)
    ctx.font = "italic 28px Arial";
    ctx.fillText(judulLaporan, width / 2, 430);

    // Tambahkan tanggal sekarang
    const tanggal = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(tanggal, 310, 593); // ✅ geser supaya sejajar titik dua

    // -------------------------------
    // Generate PDF dari canvas
    // -------------------------------
    const outPath = path.join(__dirname, `../../public/certificates/${judulLaporan}-${id}.pdf`);
    
    const pdfDoc = new PDFDocument({
      size: [width, height] // samain ukuran canvas
    });

    const out = fs.createWriteStream(outPath);
    pdfDoc.pipe(out);

    // Convert canvas ke buffer PNG
    const buffer = canvas.toBuffer("image/png");

    // Masukkan PNG ke halaman PDF
    pdfDoc.image(buffer, 0, 0, { width: width, height: height });

    // Finalize PDF
    pdfDoc.end();

    out.on("finish", () => {
      res.download(outPath); // download PDF
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;
