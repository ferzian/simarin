'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SuratPermohonan extends Model {
    static associate(models) {
      // relasi ke User
      SuratPermohonan.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  SuratPermohonan.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      suratPermohonan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SuratPermohonan',
      tableName: 'suratPermohonans',
      timestamps: true,
    }
  );

  return SuratPermohonan;
};
