'use strict';
module.exports = (sequelize, DataTypes) => {
  const Laporan = sequelize.define('Laporan', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    }
  }, {
    tableName: 'laporans',
    timestamps: true
  });

  Laporan.associate = function(models) {
    Laporan.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Laporan;
};
