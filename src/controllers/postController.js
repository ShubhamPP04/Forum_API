const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content } = req.body;
    const newPost = await Post.create({
      title,
      content,
      author: req.user.id,
    });
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', author, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (author) {
      query.author = author;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username');

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total: totalPosts,
      page: parseInt(page),
      pages: Math.ceil(totalPosts / limit),
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Make sure user is post owner
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne(); // Use deleteOne() for Mongoose 6+

    // Delete all associated comments and votes
    await Comment.deleteMany({ post: req.params.id });
    await Vote.deleteMany({ targetId: req.params.id, targetType: 'Post' });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};