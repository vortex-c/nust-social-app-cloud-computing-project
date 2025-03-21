const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');

router.post('/', postController.createPost);

router.get('/', postController.getAllPosts);

router.get('/:id', postController.getPostById);

router.get('/user/:userId?', postController.getUserPosts);

router.get('/:id/exists', postController.checkPostExists);

router.put('/:id', postController.updatePost);

router.delete('/:id', postController.deletePost);

module.exports = router;