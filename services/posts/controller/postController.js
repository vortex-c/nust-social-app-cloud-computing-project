const Post = require('../models/post');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title and content'
    });
  }

  try {
    const post = await Post.create(userId, title, content);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during post creation'
    });
  }
};

exports.getAllPosts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    const posts = await Post.getAll(limit, offset);
    
    res.json({
      success: true,
      count: posts.length,
      page,
      posts
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving posts'
    });
  }
};

exports.getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving post'
    });
  }
};

exports.checkPostExists = async (req, res) => {
  // This endpoint is only for internal service communication
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }
  
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    
    res.json({
      exists: !!post
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error checking post'
    });
  }
};

exports.getUserPosts = async (req, res) => {
  const userId = req.params.userId || req.user.id;

  try {
    const posts = await Post.findByUserId(userId);
    
    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user posts'
    });
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title or content to update'
    });
  }

  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.update(
      postId, 
      userId, 
      title || post.title, 
      content || post.content
    );
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    const deleted = await Post.delete(postId, userId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete post'
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
};