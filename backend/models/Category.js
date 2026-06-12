const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nameHi: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
