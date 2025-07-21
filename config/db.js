const { Sequelize } = require('sequelize');

console.log("Connecting to database...");
const sequelize = new Sequelize('simarin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
