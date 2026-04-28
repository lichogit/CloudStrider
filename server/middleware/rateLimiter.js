// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// 100 requests per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return `RateLimit-*` headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests – please try again later.',
      limit: 100,
      window: '15 minutes'
    });
  }
});

module.exports = limiter;
