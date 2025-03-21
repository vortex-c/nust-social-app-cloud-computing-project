require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const { pool } = require('./config/database');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Auth service is running' });
});

const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Auth database initialized successfully');
  } catch (error) {
    console.error('Error initializing auth database:', error);
  }
};

const port = process.env.AUTH_SERVICE_PORT || 3000;
app.listen(port, async () => {
  await initializeDB();
  console.log(`Auth microservice running on port ${port}`);
});