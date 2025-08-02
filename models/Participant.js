module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama: DataTypes.STRING,
    alamat: DataTypes.STRING,
    nipNim: DataTypes.STRING,
    instansi: DataTypes.STRING,
    telepon: DataTypes.STRING,
    prodi: DataTypes.STRING,
    jenjang: DataTypes.STRING,
    jenisKelamin: DataTypes.STRING,
    tanggalMulai: DataTypes.DATEONLY,
    tanggalSelesai: DataTypes.DATEONLY,
    kegiatan: DataTypes.STRING,
    lokasi: DataTypes.STRING,
    suratPengantar: DataTypes.STRING,
    pasFoto: DataTypes.STRING,
    suratSehat: DataTypes.STRING,
    statusSelesai: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Participant.associate = function (models) {
    Participant.belongsTo(models.User, { foreignKey: 'userId' });
  };
    
  return Participant;
};
