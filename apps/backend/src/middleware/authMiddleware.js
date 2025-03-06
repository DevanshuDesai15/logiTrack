import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protects routes by validating JWT tokens
 * Adds the user to the request object if valid
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_jwt_secret_do_not_use_in_production'
      );

      // Get user from the token and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware for allowing only admin and subadmin roles
 */
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'subadmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

/**
 * Middleware for allowing only users with admin role
 */
export const strictAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

/**
 * Middleware for role-based access
 * @param {Array} roles - Array of allowed roles
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
}; 