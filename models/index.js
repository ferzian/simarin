const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('simarin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Import semua model
const User = require('./User')(sequelize, DataTypes);
const Visitor = require('./Visitor')(sequelize, DataTypes);
const Participant = require('./Participant')(sequelize, DataTypes);

// Jalankan relasi antar model
User.associate?.({ Participant });
Participant.associate?.({ User });

// Export semua model + instance sequelize-nya
module.exports = {
  sequelize,
  Sequelize,
  User,
  Visitor,
  Participant,
};
