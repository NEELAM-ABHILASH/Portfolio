'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const FormEntry = require('../models/FormEntry');

const router = express.Router();

// ─── Validation rules ────────────────────────────────────────────────────────

const formValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 120 }).withMessage('Name must be 120 characters or fewer'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 200 }).withMessage('Location must be 200 characters or fewer'),

  body('currentRole')
    .trim()
    .notEmpty().withMessage('Current role is required')
    .isLength({ max: 150 }).withMessage('Role must be 150 characters or fewer'),

  body('currentCompany')
    .trim()
    .notEmpty().withMessage('Current company is required')
    .isLength({ max: 150 }).withMessage('Company must be 150 characters or fewer'),

  body('contact')
    .trim()
    .notEmpty().withMessage('Email or phone is required')
    .isLength({ max: 200 }).withMessage('Contact must be 200 characters or fewer')
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        throw new Error('Must be a valid email address or phone number');
      }
      return true;
    })
    .custom(async (value) => {
      const existing = await FormEntry.findOne({
        contact: { $regex: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (existing) {
        throw new Error('This email or phone number has already been submitted');
      }
      return true;
    }),

  body('suggestions')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Suggestions must be 2000 characters or fewer'),
];

// ─── POST /api/form — submit form ────────────────────────────────────────────

router.post('/', formValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, location, currentRole, currentCompany, contact, suggestions } = req.body;

    const entry = await FormEntry.create({
      name,
      location,
      currentRole,
      currentCompany,
      contact,
      suggestions: suggestions || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: entry,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This email or phone number has already been submitted.' });
    }
    console.error('POST /api/form error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── GET /api/form — retrieve all entries ────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const entries = await FormEntry.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    console.error('GET /api/form error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
