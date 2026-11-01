const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  titleEn: {
    type: String,
    required: true,
    trim: true,
  },
  titleHi: {
    type: String,
    required: true,
    trim: true,
  },
  contentEn: {
    type: String,
    required: true,
  },
  contentHi: {
    type: String,
    required: true,
  },
  summaryEn: {
    type: String,
    trim: true,
  },
  summaryHi: {
    type: String,
    trim: true,
  },
  images: [{
    type: String,
  }],
  videoUrl: {
    type: String,
    trim: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  district: {
    type: String,
    default: 'Sant Kabir Nagar',
  },
  subdivision: {
    type: String,
    default: 'None',
  },
  isBreaking: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  comments: [{
    name: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorName: {
    type: String,
    default: 'सदरे आलम खान',
    trim: true,
  },
  authorPhoto: {
    type: String,
    default: '',
  },
  authorRole: {
    type: String,
    default: 'मुख्य संपादक',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);
