const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.AUTH_DB_HOST || process.env.POSTGRES_HOST,
  user: process.env.AUTH_DB_USER || process.env.POSTGRES_USER,
  password: process.env.AUTH_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.AUTH_DB_NAME || process.env.POSTGRES_DB,
  port: process.env.AUTH_DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

module.exports = { pool };