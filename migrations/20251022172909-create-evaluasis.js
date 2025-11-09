'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Evaluasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      participantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Participants', // pastikan tabel Participants ada
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      kebijakan_1: { type: Sequelize.INTEGER },
      kebijakan_2: { type: Sequelize.INTEGER },
      kebijakan_3: { type: Sequelize.INTEGER },
      kebijakan_4: { type: Sequelize.INTEGER },

      profesional_1: { type: Sequelize.INTEGER },
      profesional_2: { type: Sequelize.INTEGER },
      profesional_3: { type: Sequelize.INTEGER },

      sarana_1: { type: Sequelize.INTEGER },
      sarana_2: { type: Sequelize.INTEGER },
      sarana_3: { type: Sequelize.INTEGER },
      sarana_4: { type: Sequelize.INTEGER },

      sistem_1: { type: Sequelize.INTEGER },
      sistem_2: { type: Sequelize.INTEGER },

      konsultasi_1: { type: Sequelize.INTEGER },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Evaluasis');
  },
};
