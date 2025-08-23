'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('laporans', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      judul: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileLaporan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fileSertifikat: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
      // note: kita sengaja **tidak menambahkan kolom status**, karena itu bisa di-handle di model
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('laporans');
  }
};
