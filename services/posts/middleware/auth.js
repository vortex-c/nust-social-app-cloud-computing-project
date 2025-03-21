const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token with auth service
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      { headers: { 'Authorization': token } }
    );
    
    if (response.data.success) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ success: false, message: 'Token verification failed.' });
  }
};

module.exports = authMiddleware;