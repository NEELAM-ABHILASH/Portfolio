'use strict';

const mongoose = require('mongoose');

const formEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name must be 120 characters or fewer'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location must be 200 characters or fewer'],
    },
    currentRole: {
      type: String,
      required: [true, 'Current role is required'],
      trim: true,
      maxlength: [150, 'Role must be 150 characters or fewer'],
    },
    currentCompany: {
      type: String,
      required: [true, 'Current company is required'],
      trim: true,
      maxlength: [150, 'Company must be 150 characters or fewer'],
    },
    contact: {
      type: String,
      required: [true, 'Email or phone is required'],
      trim: true,
      maxlength: [200, 'Contact must be 200 characters or fewer'],
      unique: true,
    },
    suggestions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Suggestions must be 2000 characters or fewer'],
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('FormEntry', formEntrySchema);
