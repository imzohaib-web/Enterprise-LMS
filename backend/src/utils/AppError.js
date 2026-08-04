'use strict';

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} [code] - machine-readable error code
   * @param {object} [meta] - extra data (e.g. validation details)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', meta = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, meta = null) {
    return new AppError(message, 400, 'BAD_REQUEST', meta);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  static conflict(message) {
    return new AppError(message, 409, 'CONFLICT');
  }

  static tooMany(message = 'Too many requests') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }
}

module.exports = AppError;
