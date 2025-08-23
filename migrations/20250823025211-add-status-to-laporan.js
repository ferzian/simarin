'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Laporans', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Laporans', 'status');
  }
};
