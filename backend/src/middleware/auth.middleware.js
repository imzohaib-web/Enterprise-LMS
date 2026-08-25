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
    req.tokenRole = decoded.role;
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

  const tokenRole = req.tokenRole || req.user.role;
  const userRole = req.user.role;

  // Both token role and DB user role must satisfy authorized roles (admin override permitted)
  const isTokenAllowed = roles.includes(tokenRole) || tokenRole === 'admin';
  const isUserAllowed = roles.includes(userRole) || userRole === 'admin';

  if (!isTokenAllowed || !isUserAllowed) {
    const deniedRole = !isTokenAllowed ? tokenRole : userRole;
    return next(AppError.forbidden(`Role '${deniedRole}' is not allowed to access this resource`));
  }

  if (req.user.accountStatus && !['ACTIVE', 'PENDING_APPROVAL'].includes(req.user.accountStatus)) {
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
