import mysql from "mysql";
import * as dotenv from 'dotenv';
dotenv.config();
export const db = mysql.createConnection({
    host:"localhost",
    user:process.env.HOSTUSERNAME,
    password:process.env.PASSWORD,
    database:"blog"
});