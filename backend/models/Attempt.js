const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignmentId: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  wasSuccessful: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  rowCount: {
    type: Number,
    default: 0,
  },
  executedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast lookup by user + assignment
attemptSchema.index({ userId: 1, assignmentId: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
