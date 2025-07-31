const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder jika belum ada
const createStorage = (folder) => {
  const dir = path.join(__dirname, `../public/uploads/user/${folder}`);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let target = 'surat-pengantar';
      if (file.fieldname === 'pasFoto') target = 'pas-foto';
      else if (file.fieldname === 'suratSehat') target = 'surat-sehat';
      const folderPath = path.join(__dirname, `../public/uploads/user/${target}`);
      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, unique + path.extname(file.originalname));
    }
  })
});

module.exports = upload;
