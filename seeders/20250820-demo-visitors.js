// seeders/20250820-demo-visitors.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const visitors = [];
    const now = new Date();

    for (let i = 0; i < 500; i++) { // bikin 500 data dummy
      // ambil random tanggal dalam 2 tahun terakhir
      const pastDate = new Date(
        now.getFullYear() - 2 + Math.floor(Math.random() * 3), // tahun: antara sekarang -2 s/d sekarang
        Math.floor(Math.random() * 12), // bulan 0-11
        Math.floor(Math.random() * 28) + 1, // tanggal 1-28 biar aman
        Math.floor(Math.random() * 24), // jam
        Math.floor(Math.random() * 60) // menit
      );

      visitors.push({
        ip: `192.168.0.${Math.floor(Math.random() * 255)}`,
        visitedAt: pastDate,
        createdAt: pastDate,
        updatedAt: pastDate
      });
    }

    await queryInterface.bulkInsert('Visitors', visitors, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Visitors', null, {});
  }
};
