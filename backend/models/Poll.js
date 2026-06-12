const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  questionEn: {
    type: String,
    required: true,
    trim: true,
  },
  questionHi: {
    type: String,
    required: true,
    trim: true,
  },
  option1En: {
    type: String,
    required: true,
    trim: true,
  },
  option1Hi: {
    type: String,
    required: true,
    trim: true,
  },
  option2En: {
    type: String,
    required: true,
    trim: true,
  },
  option2Hi: {
    type: String,
    required: true,
    trim: true,
  },
  option3En: {
    type: String,
    trim: true,
  },
  option3Hi: {
    type: String,
    trim: true,
  },
  votesOption1: {
    type: Number,
    default: 0,
  },
  votesOption2: {
    type: Number,
    default: 0,
  },
  votesOption3: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Poll', pollSchema);
