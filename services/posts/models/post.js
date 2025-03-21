const { pool } = require('../config/database');
const axios = require('axios');

class Post {
  static async create(userId, title, content) {
    const query = `
      INSERT INTO posts (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, title, content, created_at, updated_at
    `;
    
    const result = await pool.query(query, [userId, title, content]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT * 
      FROM posts
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    const post = result.rows[0];
    
    if (post) {
      try {
        // Fetch username from auth service
        const userResponse = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/auth/user/${post.user_id}`,
          { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
        );
        
        if (userResponse.data.success) {
          post.username = userResponse.data.user.username;
        }

        // Fetch comment count from comments service
        const commentsResponse = await axios.get(
          `${process.env.COMMENTS_SERVICE_URL}/api/comments/count/${post.id}`,
          { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
        );
        
        if (commentsResponse.data.success) {
          post.comment_count = commentsResponse.data.count;
        } else {
          post.comment_count = 0;
        }
      } catch (error) {
        console.error('Error fetching related data:', error.message);
        // Don't fail if related services are down
        post.username = 'Unknown';
        post.comment_count = 0;
      }
    }
    
    return post;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * 
      FROM posts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    const posts = result.rows;
    
    // Try to fetch username from auth service (once for all posts)
    let username = 'Unknown';
    try {
      const userResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/user/${userId}`,
        { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
      );
      
      if (userResponse.data.success) {
        username = userResponse.data.user.username;
      }
    } catch (error) {
      console.error('Error fetching username:', error.message);
    }
    
    // Add username to all posts
    posts.forEach(post => post.username = username);
    
    return posts;
  }

  static async getAll(limit = 10, offset = 0) {
    const query = `
      SELECT * 
      FROM posts
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    const posts = result.rows;
    
    if (posts.length > 0) {
      const userIds = [...new Set(posts.map(post => post.user_id))];
      
      try {
        const userResponse = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/users/batch`,
          { userIds },
          { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
        );
        
        if (userResponse.data.success) {
          const users = userResponse.data.users;
          const usernameMap = {};
          users.forEach(user => {
            usernameMap[user.id] = user.username;
          });
          
          posts.forEach(post => {
            post.username = usernameMap[post.user_id] || 'Unknown';
          });
        }
      } catch (error) {
        console.error('Error fetching usernames:', error.message);
        posts.forEach(post => post.username = 'Unknown');
      }
    }
    
    return posts;
  }

  static async update(id, userId, title, content) {
    const query = `
      UPDATE posts
      SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING id, user_id, title, content, created_at, updated_at
    `;
    
    const result = await pool.query(query, [title, content, id, userId]);
    return result.rows[0];
  }

  static async delete(id, userId) {
    // First attempt to delete all comments for this post
    try {
      await axios.delete(
        `${process.env.COMMENTS_SERVICE_URL}/api/comments/post/${id}`,
        { headers: { 'service-key': process.env.INTERNAL_API_KEY } }
      );
    } catch (error) {
      console.error('Warning: Could not delete comments:', error.message);
      // Continue with post deletion even if comments service is down
    }
    
    const query = `
      DELETE FROM posts
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }
}

module.exports = Post;