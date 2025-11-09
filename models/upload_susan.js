'use strict';

module.exports = (sequelize, DataTypes) => {
  const UploadSusan = sequelize.define('UploadSusan', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    tableName: 'upload_susan',
    timestamps: false
  });

  // 🔗 Relasi ke tabel Users
  UploadSusan.associate = function(models) {
    UploadSusan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UploadSusan;
};
