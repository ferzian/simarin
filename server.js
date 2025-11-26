require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Op } = require('sequelize');
const fetch = require('node-fetch'); // ⬅️ Menambahkan call Flask API by Daud
const { User, Visitor, sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const daftarMagangRoute = require('./routes/user/daftar-magang');
const profilRoutes = require('./routes/user/profil');
const app = express();
const laporanRoutes = require('./routes/user/laporan');
const visitorLogger = require('./middleware/visitorLogger');
const sertifikatRoutes = require('./routes/user/sertifikat');
const sertifikatAdminRoutes = require("./routes/admin/sertifikat");
const suratPermohonanRoutes = require('./routes/user/surat-permohonan');
const uploadSusanRouter = require('./routes/user/upload-susan');
const kegiatanRoute = require('./routes/user/kegiatan');
const evaluasiRouter = require('./routes/user/evaluasi');
const skmRoutes = require('./routes/user/skm');
const suratPengajuan= require('./routes/admin/surat-pengajuan');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(visitorLogger);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: 'sempur123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Halaman umum
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Routes 
app.use('/auth', authRoutes);
app.use('/admin', require('./routes/admin/dashboard'));
app.use('/admin', require('./routes/admin/data-peserta'));
app.use('/admin', require('./routes/admin/aktivitas'));
app.use('/admin', require('./routes/admin/peserta'));
app.use('/admin', require('./routes/admin/kunjungan'));
app.use('/admin', require('./routes/admin/download-rekap'));
app.use('/admin/laporan', require('./routes/admin/laporan'));
//app.use('/user', require('./routes/user/skm'));
app.use('/user/daftar-magang', require('./routes/user/daftar-magang'));
app.use('/user', require('./routes/user/user-dashboard'));
app.use('/user', profilRoutes);
app.use('/user', laporanRoutes);
app.use('/sertifikat', sertifikatRoutes);
app.use("/admin/sertifikat", sertifikatAdminRoutes);
app.use("/user/surat", suratPermohonanRoutes);
app.use('/user/upload-susan', uploadSusanRouter);
app.use('/user/kegiatan', kegiatanRoute);
app.use('/user/evaluasi', evaluasiRouter);
app.use('/user/skm', skmRoutes);
app.use('/admin/surat-pengajuan', suratPengajuan);

// Visitor tracking
app.use(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const exists = await Visitor.findOne({
    where: { ip, createdAt: { [Op.gte]: startOfMonth } }
  });

  if (!exists) {
    await Visitor.create({ ip });
  }

  next();
});

app.post('/chat', async (req, res) => {
  try {
    const response = await fetch("https://bluishly-chronogrammatic-britany.ngrok-free.dev/api/chat", { // ⬅️ Ganti URL ngrok by Daud
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Gagal menghubungi Flask API:", err);
    res.status(500).json({ error: "Gagal menghubungi Flask API" });
  }
});


sequelize.authenticate().then(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminList = [
    { username: 'Admin Sempur', email: 'admin.sempur@gmail.com', instansi: 'BRPBATPP Sempur' },
    { username: 'Admin Cibalagung', email: 'admin.cibalagung@gmail.com', instansi: 'BRPBATPP Cibalagung' },
    { username: 'Admin Depok', email: 'admin.depok@gmail.com', instansi: 'BRPBATPP Depok' },
    { username: 'Admin Cijeruk', email: 'admin.cijeruk@gmail.com', instansi: 'BRPBATPP Cijeruk' },
  ];

  for (const adminData of adminList) {
    const existing = await User.findOne({ where: { username: adminData.username } });
    if (!existing) {
      await User.create({
        username: adminData.username,
        password: hashedPassword,
        email: adminData.email,
        phone: '(0251) 8313200',
        instansi: adminData.instansi,
        role: 'admin',
        approved: true,
      });
      console.log(`✅ Admin dibuat: ${adminData.namaLengkap}`);
    }
  }

  app.listen(3000, () => console.log('✅ Server jalan di http://localhost:3000'));
});


