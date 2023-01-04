const fs = require("fs");
const pg = require('pg');

  pg.defaults.ssl = {
    rejectUnauthorized: false,
  };

  global.Promise = require('bluebird');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync(`${process.env.PATH_KNEX_CA}`).toString(),
      key: fs.readFileSync(`${process.env.PATH_KEY}`),
      cert: fs.readFileSync(`${process.env.PATH_CERT}`),
    },
    pool: {
      min: 2,
      max: 10,
    },
  }
};
