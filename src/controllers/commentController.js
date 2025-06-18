const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addCommentToPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
    });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to an existing comment
// @route   POST /api/comments/:commentId/replies
// @access  Private
exports.replyToComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const { commentId } = req.params;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const newReply = await Comment.create({
      content,
      author: req.user.id,
      post: parentComment.post, // Associate reply with the same post as parent comment
      parentComment: commentId,
    });

    res.status(201).json({ success: true, data: newReply });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getCommentsForPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId, parentComment: null }) // Only top-level comments
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username')
      .populate({
        path: 'parentComment',
        select: 'content author',
        populate: { path: 'author', select: 'username' },
      });

    const totalComments = await Comment.countDocuments({ post: postId, parentComment: null });

    // Recursively fetch replies for each top-level comment
    const fetchReplies = async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('author', 'username')
        .sort({ createdAt: 'asc' });

      comment._doc.replies = [];
      for (const reply of replies) {
        comment._doc.replies.push(await fetchReplies(reply));
      }
      return comment;
    };

    const commentsWithReplies = [];
    for (const comment of comments) {
      commentsWithReplies.push(await fetchReplies(comment));
    }

    res.status(200).json({
      success: true,
      count: commentsWithReplies.length,
      total: totalComments,
      page: parseInt(page),
      pages: Math.ceil(totalComments / limit),
      data: commentsWithReplies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Author only)
exports.updateComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Make sure user is comment owner
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this comment' });
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author only)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Make sure user is comment owner
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne(); // Use deleteOne() for Mongoose 6+

    // Recursively delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.id });
    await Vote.deleteMany({ targetId: req.params.id, targetType: 'Comment' });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};