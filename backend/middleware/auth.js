const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes that require authentication.
 * Reads JWT from Authorization header: "Bearer <token>"
 */
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired. Please log in again.' });
  }
};

/**
 * Optional auth middleware - attaches user if token exists, but doesn't block.
 * Used for routes that work for both guests and logged-in users.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch {
    req.userId = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
