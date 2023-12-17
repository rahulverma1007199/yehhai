import 'dotenv/config';

const config = {
    app :{
      port :process.env.PORT 
    },
    development: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.HOST,
      port: 3306,
      dialect:process.env.DIALECT,
      dialectOptions: {
        bigNumberStrings: true
      }
    },
    test: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.HOST,
      port: 3306,
      dialect:process.env.DIALECT,
      dialectOptions: {
        bigNumberStrings: true
      },pool: {
                max: 5,
                mib: 0,
                acquire: 30000,
                idle: 10000
              }
    },
    production: {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOSTNAME,
      port: process.env.PROD_DB_PORT,
      dialect: 'mysql',
      dialectOptions: {
        bigNumberStrings: true,
        ssl: {
          // ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt')
        }
      }
    }
};


export default config;