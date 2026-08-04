'use strict';
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 500 },
    icon:        { type: String },
    isActive:    { type: Boolean, default: true },
    courseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// Auto-generate slug from name if not provided
categorySchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
