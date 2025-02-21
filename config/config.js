require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

module.exports = {
  port: process.env.PORT,
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "test",
    name: process.env.DB_NAME || "EasyOrders",
    port: process.env.DB_PORT || 3306,
  }
};

console.log("HOST: ", process.env.DB_HOST);
console.log("USER: ", process.env.DB_USER);
console.log("PASSWORD: ", process.env.DB_PASSWORD);
console.log("NAME: ", process.env.DB_NAME);
console.log("PORT: ", process.env.DB_PORT);
console.log("PORT: ", process.env.PORT);
