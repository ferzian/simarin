const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('simarin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Import semua model
const User = require('./User')(sequelize, DataTypes);
const Visitor = require('./Visitor')(sequelize, DataTypes);
const Participant = require('./Participant')(sequelize, DataTypes);
//const Skm = require('./Skm')(sequelize, DataTypes);
const Laporan = require('./Laporan')(sequelize, Sequelize.DataTypes);

// Jalankan relasi antar model
User.associate?.({ Participant, Laporan });
Participant.associate?.({ User });
Laporan.associate?.({ User });

// Export semua model + instance sequelize-nya
module.exports = {
  sequelize,
  User,
  Visitor,
  Participant,
  Laporan,
}