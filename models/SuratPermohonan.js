'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SuratPermohonan extends Model {
    static associate(models) {
      SuratPermohonan.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  SuratPermohonan.init(
    {
      userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
      },
      suratPermohonan: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { len: [1, 255] } 
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      }
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
