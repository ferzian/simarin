const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const path = require('path');
const session = require('express-session');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.use(session({
  secret: 'sempur123', // bisa kamu ganti jadi string acak yang aman
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 2 jam
  }
}));
app.use('/auth', authRoutes);

// Sync DB and start
sequelize.sync({ force: false }).then(async () => {
  // Cek kalau belum ada admin, insert manual
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      approved: true,
    });
    console.log('Admin created');
  }

  app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
});
