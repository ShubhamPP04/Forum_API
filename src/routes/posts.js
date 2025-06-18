const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

const router = express.Router();

router.route('/')
  .post(protect, [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
  ], createPost)
  .get(getPosts);

router.route('/:id')
  .get(getPost)
  .put(protect, [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
  ], updatePost)
  .delete(protect, deletePost);

module.exports = router;