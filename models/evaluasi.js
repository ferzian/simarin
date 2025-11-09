'use strict';
module.exports = (sequelize, DataTypes) => {
  const Evaluasi = sequelize.define('Evaluasi', {
    participantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kebijakan_1: DataTypes.INTEGER,
    kebijakan_2: DataTypes.INTEGER,
    kebijakan_3: DataTypes.INTEGER,
    kebijakan_4: DataTypes.INTEGER,
    profesional_1: DataTypes.INTEGER,
    profesional_2: DataTypes.INTEGER,
    profesional_3: DataTypes.INTEGER,
    sarana_1: DataTypes.INTEGER,
    sarana_2: DataTypes.INTEGER,
    sarana_3: DataTypes.INTEGER,
    sarana_4: DataTypes.INTEGER,
    sistem_1: DataTypes.INTEGER,
    sistem_2: DataTypes.INTEGER,
    konsultasi_1: DataTypes.INTEGER,
  }, {});

  Evaluasi.associate = function(models) {
    Evaluasi.belongsTo(models.Participant, { foreignKey: 'participantId' });
  };

  return Evaluasi;
};
