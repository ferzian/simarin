'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        // ambil semua user dari DB
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM Users;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (users.length === 0) {
            throw new Error("Tidak ada user di tabel Users. Buat minimal 1 user dulu!");
        }

        const dummyParticipants = [];
        for (let i = 0; i < 30; i++) {
            const startDate = faker.date.between({ from: '2025-01-01', to: '2025-06-01' });
            const endDate = faker.date.soon({ days: faker.number.int({ min: 20, max: 200 }), refDate: startDate });

            dummyParticipants.push({
                userId: faker.helpers.arrayElement(users).id, // pilih random user dari yang ada
                nama: faker.person.fullName(),
                alamat: faker.location.streetAddress(true),
                nisNpm: faker.number.int({ min: 2021000, max: 2021999 }).toString(),
                instansi: "DUMMY_DATA",
                telepon: faker.phone.number('08##########'),
                prodi: faker.helpers.arrayElement(['Informatika', 'Manajemen', 'Agribisnis', 'Hukum', 'Biologi', 'Akuntansi']),
                jenjang: faker.helpers.arrayElement(['S1', 'S2']),
                jenisKelamin: faker.helpers.arrayElement(['Laki-Laki', 'Perempuan']),
                tanggalMulai: startDate,
                tanggalSelesai: endDate,
                kegiatan: faker.helpers.arrayElement(['Magang', 'Praktik Kerja Lapang', 'Penelitian', 'MBKM']),
                lokasi: faker.helpers.arrayElement(['Depok', 'Sempur', 'Cibalagung', 'Cijeruk']),
                suratPengantar: 'dummy-surat.pdf',
                pasFoto: 'dummy-foto.jpg',
                suratSehat: 'dummy-sehat.pdf',
                statusSelesai: faker.datatype.boolean(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('Participants', dummyParticipants, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Participants', { instansi: "DUMMY_DATA" });
    }
};
