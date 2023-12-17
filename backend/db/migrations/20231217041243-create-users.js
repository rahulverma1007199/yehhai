'use strict';
/** @type {import('sequelize-cli').Migration} */

const profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
const profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please enter your name!",
          },
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Please enter your email!",
          },
          isEmail: {
            msg: "Please enter a valid email!",
          },
        },
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Please enter your name!",
          },
        },
      },
      bio: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      profile_img: {
        type:Sequelize.STRING,
        defaultValue: () => {
          return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`
      } ,

      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      social_links:{
        type:Sequelize.JSON,
        allowNull:true
      },
      total_posts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_reads: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      google_auth: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull:false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull:false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};