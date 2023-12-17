'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      blog_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    banner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    des: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    content: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    tags: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    total_likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    total_comments: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_reads: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_parent_comments: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    draft: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addColumn(
      'blogs','author', {
        type: Sequelize.INTEGER,
        references:{
          model:'users',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'SET NULL'
      },
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blogs');
  }
};