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

    q1: DataTypes.STRING,
    q2: DataTypes.STRING,
    q3: DataTypes.STRING,
    q4: DataTypes.STRING,
    q5: DataTypes.STRING,
    q6: DataTypes.STRING,
    q7: DataTypes.STRING,
    q8: DataTypes.STRING,
    q9: DataTypes.STRING,
  });

  return Survey;
};
