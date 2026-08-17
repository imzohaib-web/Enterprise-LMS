'use strict';
const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Verifies JWT Bearer token and attaches req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw AppError.unauthorized('No access token provided');
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId).select('-password').lean();
    if (!user) throw AppError.unauthorized('User not found');
    if (!user.isActive || ['SUSPENDED', 'DEACTIVATED', 'REJECTED'].includes(user.accountStatus)) {
      throw AppError.forbidden(`Account is ${user.accountStatus ? user.accountStatus.toLowerCase() : 'deactivated'}`);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }
    next(err);
  }
};

/**
 * Role-based access control guard
 * Usage: authorize('admin', 'instructor')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(AppError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(AppError.forbidden(`Role '${req.user.role}' is not allowed to access this resource`));
  }
  if (req.user.accountStatus && req.user.accountStatus !== 'ACTIVE') {
    return next(AppError.forbidden(`Account is ${req.user.accountStatus.toLowerCase()} and cannot access this resource`));
  }
  next();
};

/**
 * Soft auth – attaches user if token present, but doesn't reject unauthenticated
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return next();
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password').lean();
    if (user && user.isActive) req.user = user;
  } catch {
    /* ignore */
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
