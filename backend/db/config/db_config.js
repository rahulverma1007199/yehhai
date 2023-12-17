import {Sequelize} from "sequelize";
import config from "./database.js";

const {development:{database, username, password, host, dialect}}  = config;

const sequelize =  new Sequelize(database,username ,password, {
  logging: false,
    host: host,
    dialect: dialect
  });


  export default sequelize;


