const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT,
  devenv: process.env.NODE_ENV,
  dburi: process.env.DATABASE,
  jwt_secret: process.env.JWT_SECRET,
};
