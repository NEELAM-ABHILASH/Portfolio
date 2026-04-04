'use strict';

const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const FormEntry = require('../models/FormEntry');

const router = express.Router();

// ─── Strict rate limiter for admin (5 attempts per 15 min per IP) ────────────
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// ─── Timing-safe password comparison ─────────────────────────────────────────
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  // Always run the comparison (same-length buffers) to prevent timing leaks
  const len = Math.max(bufA.length, bufB.length);
  const padA = Buffer.concat([bufA, Buffer.alloc(len - bufA.length)]);
  const padB = Buffer.concat([bufB, Buffer.alloc(len - bufB.length)]);
  return crypto.timingSafeEqual(padA, padB) && bufA.length === bufB.length;
}

// ─── POST /api/admin/view ─────────────────────────────────────────────────────
router.post(
  '/view',
  adminLimiter,
  [body('password').trim().notEmpty().withMessage('Password is required.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Password is required.' });
    }

    const adminPassword = process.env.DB_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ success: false, message: 'Admin access is not configured on the server.' });
    }

    if (!safeCompare(req.body.password, adminPassword)) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Access denied.' });
    }

    try {
      const entries = await FormEntry.find({}, '-__v').sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: entries.length, data: entries });
    } catch (err) {
      console.error('POST /api/admin/view error:', err);
      return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

module.exports = router;
