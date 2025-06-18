const express = require('express');
const {
  addCommentToPost,
  replyToComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

const router = express.Router();

// Add comment to a post
router.post(
  '/posts/:postId/comments',
  protect,
  [check('content', 'Comment content is required').not().isEmpty()],
  addCommentToPost
);

// Reply to a comment
router.post(
  '/:commentId/replies',
  protect,
  [check('content', 'Reply content is required').not().isEmpty()],
  replyToComment
);

// Get comments for a post
router.get('/posts/:postId/comments', getCommentsForPost);

// Update a comment
router.put(
  '/:id',
  protect,
  [check('content', 'Comment content is required').not().isEmpty()],
  updateComment
);

// Delete a comment
router.delete('/:id', protect, deleteComment);

module.exports = router;