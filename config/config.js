require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'simarin',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: (process.env.DB_NAME || 'simarin') + '_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: (process.env.DB_NAME || 'simarin') + '_production',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  }
};