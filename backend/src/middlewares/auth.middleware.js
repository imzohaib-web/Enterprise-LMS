const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

/**
 * Middleware to verify JWT token and attach user to request object.
 */
const protect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach decoded user info to request
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role || 'student',
      name: decoded.name || 'Student Name',
      email: decoded.email || '',
    };

    next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restrict access to specific roles (e.g., student, instructor, admin)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
