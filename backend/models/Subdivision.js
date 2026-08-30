const mongoose = require('mongoose');

const subdivisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subdivision', subdivisionSchema);
