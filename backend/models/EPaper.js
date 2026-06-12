const mongoose = require('mongoose');

const epaperSchema = new mongoose.Schema({
  titleEn: {
    type: String,
    required: true,
  },
  titleHi: {
    type: String,
    required: true,
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
    unique: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EPaper', epaperSchema);
