'use strict';
const { sendError } = require('../utils/response');
const config = require('../config/env');

const errorMiddleware = (err, req, res, _next) => {
  // Log full error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error(`❌ [${err.code || 'ERROR'}] ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const meta = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, { statusCode: 400, message: 'Validation failed', code: 'VALIDATION_ERROR', meta });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, { statusCode: 400, message: `Invalid ${err.path}: ${err.value}`, code: 'INVALID_ID' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, {
      statusCode: 409,
      message: `Duplicate value for ${field}`,
      code: 'DUPLICATE_KEY',
      meta: err.keyValue,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { statusCode: 401, message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { statusCode: 401, message: 'Token expired', code: 'TOKEN_EXPIRED' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, { statusCode: 413, message: 'File size exceeds limit', code: 'FILE_TOO_LARGE' });
  }

  // Operational (AppError)
  if (err.isOperational) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }

  // Unknown errors
  return sendError(res, {
    statusCode: 500,
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
    code: 'INTERNAL_ERROR',
  });
};

module.exports = errorMiddleware;
