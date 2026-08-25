'use strict';
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Compatibility wrapper mapping protect -> authenticate and restrictTo -> authorize
 */
const protect = authenticate;
const restrictTo = authorize;

module.exports = {
  protect,
  restrictTo,
};
