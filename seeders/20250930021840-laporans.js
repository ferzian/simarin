'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map(u => u.id);

    await queryInterface.bulkInsert('Laporans', Array.from({ length: 30 }).map((_, i) => ({
      userId: userIds[i % userIds.length],
      judul: `Laporan ${i + 1}`,
      fileLaporan: `laporan${i + 1}.pdf`,
      status: i % 2 === 0 ? 'approved' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Laporans', null, {});
  }
};
