'use strict';
import { Model,DataTypes } from 'sequelize';
import sequelize from "../config/db_config.js";

const profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
const profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Blogs, {foreignKey: 'author',});
    }
  }
  Users.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please enter your name!",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please enter your name!",
        },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    profile_img: {
      type:DataTypes.STRING,
      defaultValue: () => {
        return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`
    } ,

    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    social_links:{
      type:DataTypes.JSON,
      allowNull:true
    },
    total_posts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_reads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    google_auth: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
      defaultValue: sequelize.fn('NOW'),
      type: DataTypes.DATE
    },
    updatedAt: {
      defaultValue: sequelize.fn('NOW'),
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'users',
    timestamps: true,
  });

  export default Users
