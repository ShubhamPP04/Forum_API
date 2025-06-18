const express = require('express');
const { vote } = require('../controllers/voteController');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

const router = express.Router();

router.post(
  '/:targetType/:targetId/vote',
  protect,
  [
    check('value', 'Vote value must be 1 (upvote) or -1 (downvote)').isIn([1, -1]),
  ],
  vote
);

module.exports = router;