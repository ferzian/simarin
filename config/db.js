const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("Connecting to database...");

const sequelize = new Sequelize(
  process.env.DB_NAME || 'simarin',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Test koneksi
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;