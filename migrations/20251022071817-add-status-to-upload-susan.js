'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('upload_susan', 'status', {
      type: Sequelize.ENUM('pending', 'approved'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('upload_susan', 'status');
  }
};
