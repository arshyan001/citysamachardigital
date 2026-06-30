const mongoose = require('mongoose');

const editorInfoSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: true,
    trim: true,
  },
  nameHi: {
    type: String,
    required: true,
    trim: true,
  },
  roleEn: {
    type: String,
    default: 'Editor-in-Chief',
    trim: true,
  },
  roleHi: {
    type: String,
    default: 'मुख्य संपादक',
    trim: true,
  },
  descriptionEn: {
    type: String,
    default: '',
    trim: true,
  },
  descriptionHi: {
    type: String,
    default: '',
    trim: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EditorInfo', editorInfoSchema);
