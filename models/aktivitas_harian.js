'use strict';
module.exports = (sequelize, DataTypes) => {
  const AktivitasHarian = sequelize.define('AktivitasHarian', {
    participant_id: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY,
    kegiatan: DataTypes.TEXT
  }, {
    tableName: 'aktivitas_harian'
  });

  AktivitasHarian.associate = function(models) {
    AktivitasHarian.belongsTo(models.Participant, { foreignKey: 'participant_id' });
  };

  return AktivitasHarian;
};
