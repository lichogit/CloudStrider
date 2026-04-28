// server/db/client.js
const { Pool } = require('pg');
require('dotenv').config();

// Connection string from environment (e.g., DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // optional: SSL config for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[D] Unexpected pg idle client error', err);
});

module.exports = pool;
