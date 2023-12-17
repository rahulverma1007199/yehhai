'use strict';
import { Model,DataTypes } from 'sequelize';
import sequelize from "../config/db_config.js";

  class Blogs extends Model {
    static associate(models) {
      this.belongsTo(models.Users, {foreignKey: 'author',onDelete: 'cascade'});
    }
  }
  Blogs.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    blog_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  des: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  author: {
    type: DataTypes.INTEGER,
    references:{
      model:'users',
      key:'id'
    },
    onUpdate:'CASCADE',
    onDelete:'SET NULL'
  },
  total_likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
  },
  total_comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_reads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_parent_comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  draft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    createdAt: {
      defaultValue: sequelize.fn('NOW'),
      type: DataTypes.DATE
    },
    updatedAt: {
      defaultValue: sequelize.fn('NOW'),
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'blogs',
    timestamps: true,
  });

  export default Blogs