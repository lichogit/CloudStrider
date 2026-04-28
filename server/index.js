// server/index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimiter = require('./middleware/rateLimiter');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 7000;

// Basic security hardening
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting globally
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes (OAuth2 callback, NextAuth placeholder)
app.use('/auth', authRouter);
// User utilities (password hashing)
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`[D] Express server listening on port ${PORT}`);
});
