module.exports = (sequelize, DataTypes) => {
    const Skm = sequelize.define('Skm', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jenisLayanan: DataTypes.STRING,
      rating: DataTypes.INT,
      komentar: DataTypes.STRING,
    
    });
  
    Skm.associate = function (models) {
        Skm.belongsTo(models.User, { foreignKey: 'userId' });
    };
      
    return Skm;
  };
  