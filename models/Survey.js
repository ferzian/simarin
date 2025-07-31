module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    rating: DataTypes.STRING,
    comment: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
  });
  return Survey;
};