require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const postRoutes = require('./routes/post');
const { pool } = require('./config/database');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Auth middleware for this service
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token with auth service
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

app.use('/api/posts', authMiddleware, postRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Posts service is running' });
});

const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`);
    
    console.log('Posts database initialized successfully');
  } catch (error) {
    console.error('Error initializing posts database:', error);
  }
};

const port = process.env.POSTS_SERVICE_PORT || 3001;
app.listen(port, async () => {
  await initializeDB();
  console.log(`Posts microservice running on port ${port}`);
});