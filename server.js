const { Op } = require('sequelize');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { User, Visitor, sequelize } = require('./models');
const authRoutes = require('./routes/auth');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(session({
  secret: 'sempur123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

// Routes
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.use(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Cek apakah IP sudah tercatat bulan ini
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
app.use('/auth', authRoutes);
app.use('/auth/admin', require('./routes/admin/dashboard'));
app.use('/auth/admin', require('./routes/admin/download-visitors'));

// Sync DB and start server
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

  app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
});
