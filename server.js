const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Op } = require('sequelize');
const { User, Visitor, sequelize } = require('./models');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware bawaan
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware session
app.use(session({
  secret: 'sempur123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 jam
}));

// Middleware untuk menyimpan session user ke res.locals
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes halaman umum
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Routes autentikasi & admin
app.use('/auth', authRoutes);
app.use('/auth/admin', require('./routes/admin/dashboard'));
app.use('/auth/admin', require('./routes/admin/download-visitors'));

// ✅ Tambahkan route user (DAFTAR MAGANG & SERTIFIKAT)
app.use('/auth/user/daftar-magang', require('./routes/user/daftar-magang'));
app.use('/auth/user', require('./routes/user/sertifikat'));

// Middleware log IP visitor (letakkan di bawah route)
app.use(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const exists = await Visitor.findOne({
    where: {
      ip,
      createdAt: { [Op.gte]: startOfMonth }
    }
  });

  if (!exists) {
    await Visitor.create({ ip });
  }

  next();
});

// Sync database & jalankan server
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
