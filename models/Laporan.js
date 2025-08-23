'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      Laporan.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Laporan.init({
    userId: DataTypes.INTEGER,
    judul: DataTypes.STRING,
    fileLaporan: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // default kalau user baru upload
    }
  }, {
    sequelize,
    modelName: 'Laporan',
  });

  return Laporan;
};
