'use strict';

module.exports = (sequelize, DataTypes) => {
  const Skm = sequelize.define('Skm', {
    // Data Responden
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

    // Pertanyaan Penilaian
    penilaian_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_3: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_4: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_5: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_6: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_7: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_8: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penilaian_9: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Kesimpulan
    kesimpulan: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // Nilai total
    nilai_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Kritik
    kritik: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Saran
    saran: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    tableName: 'skms', // pastikan sesuai dengan migration
    timestamps: true // otomatis pakai createdAt dan updatedAt
  });

  return Skm;
};
