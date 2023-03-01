import * as dotenv from 'dotenv';
dotenv.config();

const configs = Object.freeze({
  database: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  },
  port: process.env.PORT,
  password_salt_round: parseInt(process.env.PASSWORD_SALT_ROUND),
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_expire_minutes: parseInt(
    process.env.ACCESS_TOKEN_EXPIRE_MINUTES
  ),
  refresh_token_key: process.env.REFRESH_TOKEN_KEY,
  refresh_token_expire_days: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS)
});

export default configs;
