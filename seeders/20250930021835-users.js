'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const instansiList = [
      'Universitas Pakuan',
      'Politeknik Negeri',
      'Institut Pertanian Bogor',
      'Universitas Indonesia',
      'Sekolah Tinggi Teknologi Bandung'
    ];

    const users = Array.from({ length: 30 }).map((_, i) => ({
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: `hashed_pass${i + 1}`, // nanti login user ini bukan real, cuma dummy
      phone: `08123${1000 + i}`,
      instansi: instansiList[i % instansiList.length],
      role: 'user',
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
