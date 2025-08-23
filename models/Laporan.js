'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      Laporan.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Laporan.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileLaporan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileSertifikat: {
      type: DataTypes.STRING,
      allowNull: true
    },

  }, {
    sequelize,
    modelName: 'Laporan',
    tableName: 'laporans',
    timestamps: true
  });

  return Laporan;
};
