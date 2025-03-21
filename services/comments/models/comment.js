const { pool } = require('../config/database');
const axios = require('axios');

class Comment {
  static async create(postId, userId, content) {
    // First verify post exists in posts service
    try {
      const postResponse = await axios.get(
        `${process.env.POSTS_SERVICE_URL}/api/posts/${postId}/exists`,
        { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
      );
      
      if (!postResponse.data.exists) {
        throw new Error('Post not found');
      }
    } catch (error) {
      throw new Error('Could not verify post: ' + error.message);
    }
    
    const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, user_id, content, created_at, updated_at
    `;
    
    const result = await pool.query(query, [postId, userId, content]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT * 
      FROM comments
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    const comment = result.rows[0];
    
    if (comment) {
      try {
        // Fetch username from auth service
        const userResponse = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/auth/user/${comment.user_id}`,
          { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
        );
        
        if (userResponse.data.success) {
          comment.username = userResponse.data.user.username;
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
        comment.username = 'Unknown';
      }
    }
    
    return comment;
  }

  static async findByPostId(postId) {
    const query = `
      SELECT * 
      FROM comments
      WHERE post_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [postId]);
    const comments = result.rows;
    
    // Try to enrich comments with usernames
    if (comments.length > 0) {
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      
      try {
        const userResponse = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/users/batch`,
          { userIds },
          { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
        );
        
        if (userResponse.data.success) {
          const users = userResponse.data.users;
          // Create a map of userId to username
          const usernameMap = {};
          users.forEach(user => {
            usernameMap[user.id] = user.username;
          });
          
          // Add username to each comment
          comments.forEach(comment => {
            comment.username = usernameMap[comment.user_id] || 'Unknown';
          });
        }
      } catch (error) {
        console.error('Error fetching usernames:', error.message);
        // Set default usernames if service is unavailable
        comments.forEach(comment => comment.username = 'Unknown');
      }
    }
    
    return comments;
  }

  static async countByPostId(postId) {
    const query = `
      SELECT COUNT(*) as count
      FROM comments
      WHERE post_id = $1
    `;
    
    const result = await pool.query(query, [postId]);
    return parseInt(result.rows[0].count);
  }

  static async update(id, userId, content) {
    const query = `
      UPDATE comments
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, post_id, user_id, content, created_at, updated_at
    `;
    
    const result = await pool.query(query, [content, id, userId]);
    return result.rows[0];
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM comments
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  static async deleteAllForPost(postId) {
    const query = `
      DELETE FROM comments
      WHERE post_id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [postId]);
    return result.rowCount;
  }
}

module.exports = Comment;