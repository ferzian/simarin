'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('suratPermohonans', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      after: 'suratPermohonan'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('suratPermohonans', 'status');
  }
};
