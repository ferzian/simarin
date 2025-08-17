'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Skm extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId' });    
    }
  }

  Skm.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      jenis_kelamin: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      usia: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pendidikan: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pekerjaan: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      penilaian_1: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_2: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_3: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_4: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_5: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_6: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_7: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_8: { type: DataTypes.INTEGER, allowNull: false },
      penilaian_9: { type: DataTypes.INTEGER, allowNull: false },

      nilai_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kritik: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      saran: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Skm',
      tableName: 'skms',
    }
  );

  
  return Skm;
};
