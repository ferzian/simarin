'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil semua user id dari tabel Users
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map(u => u.id);

    // Variasi data
    const instansiList = [
      'Universitas Pakuan',
      'Politeknik Negeri',
      'Institut Pertanian Bogor',
      'Universitas Indonesia',
      'Sekolah Tinggi Teknologi Bandung'
    ];

    const kegiatanList = [
      'Magang',
      'PRAKTEK KERJA LAPANG',
      'PENELITIAN',
      'MBKM'
    ];

    const lokasiList = [
      'Depok',
      'Sempur',
      'Cibalagung',
      'Cijeruk'
    ];

    const prodiList = [
      'Informatika',
      'Akuntansi',
      'Manajemen',
      'Farmasi',
      'Teknik Sipil'
    ]

    const jenjangList = [
      'D3/D4',
      'S1',
      'S2',
      'S3'
    ]

    await queryInterface.bulkInsert('Participants',
      Array.from({ length: 30 }).map((_, i) => ({
        userId: userIds[i % userIds.length],
        nama: `Peserta ${i + 1}`,
        alamat: `Jl. Contoh No.${i + 1}`,
        nisNpm: `NPM${2000 + i}`,
        instansi: instansiList[i % instansiList.length],
        telepon: `08122233${200 + i}`,
        prodi: prodiList[i % prodiList.length],
        jenjang: jenjangList[i % jenjangList.length],
        jenisKelamin: i % 2 === 0 ? 'Laki-Laki' : 'Perempuan',
        tanggalMulai: `2025-07-${(i % 28) + 1}`,
        tanggalSelesai: `2025-12-${(i % 28) + 1}`,
        kegiatan: kegiatanList[i % kegiatanList.length],
        lokasi: lokasiList[i % lokasiList.length],
        suratPengantar: `surat_pengantar${i + 1}.pdf`,
        pasFoto: `pasfoto${i + 1}.jpg`,
        suratSehat: `suratsehat${i + 1}.pdf`,
        statusSelesai: i % 4 === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Participants', null, {});
  }
};
