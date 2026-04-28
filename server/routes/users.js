// server/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/client');

// Password complexity regex: min 8 chars, at least one upper, one lower, one digit, one special
const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// Helper to validate password complexity
function validatePassword(pwd) {
  return complexityRegex.test(pwd);
}

// Hash password with 12 salt rounds
async function hashPassword(pwd) {
  const saltRounds = 12;
  return await bcrypt.hash(pwd, saltRounds);
}

// Example endpoint to create a user (adjust table/fields as needed)
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password does not meet complexity requirements' });
  }
  try {
    const hashed = await hashPassword(password);
    const sql = `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`;
    const { rows } = await pool.query(sql, [email, hashed, name || null]);
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('[D] User registration error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
