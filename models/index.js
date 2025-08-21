const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('simarin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Import semua model
const User = require('./User')(sequelize, DataTypes);
const Visitor = require('./Visitor')(sequelize, DataTypes);
const Participant = require('./Participant')(sequelize, DataTypes);
const Survey = require('./Survey')(sequelize, DataTypes);
const Skm = require('./Skm')(sequelize, DataTypes);
const Laporan = require('./laporan')(sequelize, Sequelize.DataTypes);

// Jalankan relasi antar model
User.associate?.({ Participant });
Participant.associate?.({ User });

// Export semua model + instance sequelize-nya
module.exports = {
  sequelize,
  User,
  Visitor,
  Participant,
  Survey,
  Skm,
  Laporan,
  Participant,
}