const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  linkUrl: {
    type: String,
    trim: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  slot: {
    type: String,
    enum: ['top', 'sidebar'],
    default: 'sidebar',
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'original'],
    default: 'original',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Advertisement', advertisementSchema);
