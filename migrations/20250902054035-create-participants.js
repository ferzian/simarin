'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Participants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      nama: Sequelize.STRING,
      alamat: Sequelize.STRING,
      nisNpm: Sequelize.STRING,
      instansi: Sequelize.STRING,
      telepon: Sequelize.STRING,
      prodi: Sequelize.STRING,
      jenjang: Sequelize.STRING,
      jenisKelamin: Sequelize.STRING,
      tanggalMulai: Sequelize.DATEONLY,
      tanggalSelesai: Sequelize.DATEONLY,
      kegiatan: Sequelize.STRING,
      lokasi: Sequelize.STRING,
      suratPengantar: Sequelize.STRING,
      pasFoto: Sequelize.STRING,
      suratSehat: Sequelize.STRING,
      statusSelesai: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Participants');
  }
};
