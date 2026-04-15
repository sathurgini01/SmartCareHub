const jwt = require('jsonwebtoken');

// Gateway-level auth middleware
// Verifies JWT and attaches user info to headers for downstream services
const gatewayAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Pass user info to downstream services via headers
    req.headers['x-user-id'] = decoded.userId || decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-name'] = decoded.name;
    req.headers['x-user-email'] = decoded.email;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

// Optional auth - passes through even without token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.headers['x-user-id'] = decoded.userId || decoded.id;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-name'] = decoded.name;
      req.headers['x-user-email'] = decoded.email;
    }
  } catch (error) {
    // Token invalid but we allow through
  }
  next();
};

module.exports = { gatewayAuth, optionalAuth };
