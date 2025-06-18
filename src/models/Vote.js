const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Post', 'Comment'],
  },
  targetId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: 'targetType', // Dynamically reference either 'Post' or 'Comment'
  },
  value: {
    type: Number,
    required: true,
    enum: [1, -1], // 1 for upvote, -1 for downvote
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only vote once per target (post or comment)
VoteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);