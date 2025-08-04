'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Users', {
      fields: ['username'],
      type: 'unique',
      name: 'unique_username_constraint'
    });
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_email_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'unique_username_constraint');
    await queryInterface.removeConstraint('Users', 'unique_email_constraint');
  }
};
