'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'simarin',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);

const db = {};

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Participant = require('./Participant')(sequelize, DataTypes);
db.Laporan = require('./Laporan')(sequelize, DataTypes);
db.Visitor = require('./Visitor')(sequelize, DataTypes); 
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
