'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Visitors', Array.from({ length: 30 }).map((_, i) => ({
      ip: `192.168.1.${20 + i}`,
      visitedAt: new Date(Date.now() - i * 3600 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Visitors', null, {});
  }
};
