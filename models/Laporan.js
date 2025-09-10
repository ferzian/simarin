'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      Laporan.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });

      Laporan.belongsTo(models.Participant, { 
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'participant'
      });
    }
  }

  Laporan.init({
    userId: DataTypes.INTEGER,
    judul: DataTypes.STRING,
    fileLaporan: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Laporan',
    tableName: 'laporans'
  });

  return Laporan;
};
