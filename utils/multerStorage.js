// utils/multerStorage.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDirSync(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function laporanStorage(){
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.session.user.id;
      const dir = path.join(__dirname, '..', 'public', 'uploads', 'user', 'laporan', String(userId));
      ensureDirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = Date.now() + '-' + Math.random().toString(36).slice(2,9) + ext;
      cb(null, name);
    }
  });
}

const uploadLaporan = multer({
  storage: laporanStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Hanya PDF atau DOCX yang diperbolehkan'));
  }
});

module.exports = { uploadLaporan };
