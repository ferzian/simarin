const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('simarin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', // atau 'sqlite', 'postgres', 'mariadb'
});

// Import semua model
const User = require('./User')(sequelize, DataTypes);
const Visitor = require('./Visitor')(sequelize, DataTypes);

// Export semua model + instance sequelize-nya
module.exports = {
  sequelize,
  Sequelize,
  User,
  Visitor
};
