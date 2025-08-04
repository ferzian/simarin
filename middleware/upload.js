const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi storage multer dengan folder dinamis
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'surat-pengantar';
    if (file.fieldname === 'pas_foto') folder = 'pas-foto';
    else if (file.fieldname === 'surat_sehat') folder = 'surat-sehat';

    const folderPath = path.join(__dirname, `../public/uploads/user/${folder}`);
    fs.mkdirSync(folderPath, { recursive: true }); // Buat folder jika belum ada
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname)); // Nama file unik
  }
});

const upload = multer({ storage });

module.exports = upload;
