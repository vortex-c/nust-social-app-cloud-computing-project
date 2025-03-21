require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const commentRoutes = require('./routes/comment');
const { pool } = require('./config/database');

app.use(cors());
app.use(express.json());

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const authResponse = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      { headers: { 'Authorization': token } }
    );
    
    if (authResponse.data.success) {
      req.user = authResponse.data.user;
      next();
    } else {
      res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth service error:', error.message);
    res.status(401).json({ success: false, message: 'Token verification failed.' });
  }
};

app.use('/api/comments', authMiddleware, commentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Comments service is running' });
});

const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`);
    
    console.log('Comments database initialized successfully');
  } catch (error) {
    console.error('Error initializing comments database:', error);
  }
};

const port = process.env.COMMENTS_SERVICE_PORT || 3002;
app.listen(port, async () => {
  await initializeDB();
  console.log(`Comments microservice running on port ${port}`);
});