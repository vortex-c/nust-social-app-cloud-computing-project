const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');

router.post('/', commentController.createComment);

router.get('/post/:postId', commentController.getCommentsByPostId);

router.get('/count/:postId', commentController.getCommentCount);

router.put('/:id', commentController.updateComment);

router.delete('/:id', commentController.deleteComment);

router.delete('/post/:postId', commentController.deleteAllForPost);

module.exports = router;