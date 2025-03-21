const Comment = require('../models/comment');

exports.createComment = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.id;

  if (!postId || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide postId and content'
    });
  }

  try {
    const comment = await Comment.create(postId, userId, content);
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Post not found')) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during comment creation'
    });
  }
};

exports.getCommentsByPostId = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await Comment.findByPostId(postId);
    
    res.json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving comments'
    });
  }
};

exports.getCommentCount = async (req, res) => {
  // This endpoint is only for internal service communication
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }
  
  const postId = req.params.postId;

  try {
    const count = await Comment.countByPostId(postId);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error counting comments'
    });
  }
};

exports.updateComment = async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide content to update'
    });
  }

  try {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    const updatedComment = await Comment.update(commentId, userId, content);
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating comment'
    });
  }
};

exports.deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    const deleted = await Comment.delete(commentId, userId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment'
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

exports.deleteAllForPost = async (req, res) => {
  // This endpoint is only for internal service communication
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }
  
  const postId = req.params.postId;

  try {
    const count = await Comment.deleteAllForPost(postId);
    
    res.json({
      success: true,
      message: `${count} comments deleted`,
      count
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comments'
    });
  }
};