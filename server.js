const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Op } = require('sequelize');
const { User, Visitor, sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const daftarMagangRoute = require('./routes/user/daftar-magang');
const profilRoutes = require('./routes/user/profil');

const app = express();

// ... semua require di awal tetap

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
app.get('/', (req, res) => res.render('index')); // ← Kembalikan baris ini
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));


// Routes 
app.use('/auth', authRoutes);
app.use('/admin', require('./routes/admin/dashboard'));
// app.use('/auth/admin', require('./routes/admin/download-visitors')); // ← sementara nonaktifkan jika file belum ada
app.use('/admin', require('./routes/admin/approval-akun'));
app.use('/admin', require('./routes/admin/approval-peserta'));
app.use('/admin', require('./routes/admin/peserta'));
app.use('/admin', require('./routes/admin/skm'));
app.use('/admin', require('./routes/admin/download-rekap'));

app.use('/user/daftar-magang', require('./routes/user/daftar-magang'));
app.use('/user', require('./routes/user/sertifikat'));
app.use('/user/dashboard', require('./routes/user/user-dashboard'));
app.use('/user', profilRoutes);


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

// Sync DB + Start server
sequelize.sync({ alter: true }).then(async () => {
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      phone: '1234567890',
      dob: '2000-01-01',
      role: 'admin',
      approved: true,
    });
    console.log('Admin created');
  }

  app.listen(3000, () => console.log('✅ Server jalan di http://localhost:3000'));
});
