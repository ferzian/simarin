// models/Survey.js
module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    name: DataTypes.STRING,
    school: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    location: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.INTEGER,
    education: DataTypes.STRING,
    comment: DataTypes.TEXT,

    q1: DataTypes.INTEGER,
    q2: DataTypes.INTEGER,
    q3: DataTypes.INTEGER,
    q4: DataTypes.INTEGER,
    q5: DataTypes.INTEGER,
    q6: DataTypes.INTEGER,
    q7: DataTypes.INTEGER,
    q8: DataTypes.INTEGER,
    q9: DataTypes.INTEGER,
  });

  return Survey;
};
