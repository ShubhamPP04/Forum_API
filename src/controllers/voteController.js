const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Helper function to update target's vote counts
const updateTargetVoteCounts = async (targetType, targetId) => {
  const upvotes = await Vote.countDocuments({ targetType, targetId, value: 1 });
  const downvotes = await Vote.countDocuments({ targetType, targetId, value: -1 });

  if (targetType === 'Post') {
    await Post.findByIdAndUpdate(targetId, { upvotes, downvotes });
  } else if (targetType === 'Comment') {
    await Comment.findByIdAndUpdate(targetId, { upvotes, downvotes });
  }
};

// @desc    Vote on a post or comment
// @route   POST /api/:targetType/:targetId/vote
// @access  Private
exports.vote = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params; // targetType will be 'posts' or 'comments'
    const { value } = req.body; // 1 for upvote, -1 for downvote

    if (!['posts', 'comments'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const modelName = targetType === 'posts' ? 'Post' : 'Comment';
    const TargetModel = mongoose.model(modelName);
    const target = await TargetModel.findById(targetId);

    if (!target) {
      return res.status(404).json({ message: `${modelName} not found` });
    }

    // Check if user has already voted on this target
    let existingVote = await Vote.findOne({
      user: req.user.id,
      targetId,
      targetType: modelName,
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // User is trying to cast the same vote again, remove the vote
        await existingVote.deleteOne();
        await updateTargetVoteCounts(modelName, targetId);
        return res.status(200).json({ success: true, message: 'Vote removed' });
      } else {
        // User is changing their vote
        existingVote.value = value;
        await existingVote.save();
        await updateTargetVoteCounts(modelName, targetId);
        return res.status(200).json({ success: true, message: 'Vote changed', data: existingVote });
      }
    } else {
      // New vote
      const newVote = await Vote.create({
        user: req.user.id,
        targetType: modelName,
        targetId,
        value,
      });
      await updateTargetVoteCounts(modelName, targetId);
      return res.status(201).json({ success: true, message: 'Vote cast', data: newVote });
    }
  } catch (error) {
    // Handle duplicate key error (user trying to vote twice simultaneously)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted on this item.' });
    }
    next(error);
  }
};