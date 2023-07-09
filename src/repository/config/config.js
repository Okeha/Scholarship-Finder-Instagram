const path = require("path");
require("dotenv").config({ path: __dirname + "/../../../.env" });

// console.log(process.env.DEV_USER_NAME);

module.exports = {
  development: {
    username: `${process.env.DEV_USER_NAME}`,
    password: `${process.env.DEV_PASSWORD}`,
    database: `${process.env.DEV_DATABASE_NAME}`,
    host: `${process.env.DEV_HOST_NAME}`,
    url: `${process.env.DEV_URL}`,
    dialect: "postgres",
  },
  production: {
    username: `${process.env.DEV_USER_NAME}`,
    password: `${process.env.DEV_PASSWORD}`,
    database: `${process.env.DEV_DATABASE_NAME}`,
    host: `${process.env.DEV_HOST_NAME}`,
    url: `${process.env.DEV_URL}`,
    dialect: "postgres",
  },
};

// console.log(module.exports);
