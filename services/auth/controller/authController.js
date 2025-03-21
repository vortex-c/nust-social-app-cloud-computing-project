const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide username, email and password' 
    });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const user = await User.create(username, email, password);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getUserById = async (req, res) => {
  // Check if this is an internal service request
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getUsersBatch = async (req, res) => {
  // Check if this is an internal service request
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }

  const { userIds } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of user IDs'
    });
  }

  try {
    const users = await User.findManyByIds(userIds);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        username: user.username
      }))
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.verifyToken = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
};

exports.getUserById = async (req, res) => {
  // Verify this is an internal service request
  if (!req.header('service-key') || req.header('service-key') !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized internal service request' 
    });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
