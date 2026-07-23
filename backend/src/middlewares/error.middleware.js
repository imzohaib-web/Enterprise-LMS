const AppError = require('../utils/appError');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'Duplicate field value';
    const message = `Duplicate value entered: ${value}. Please use another value!`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }

  // Handle JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 400, 'Validation Error', formattedErrors);
  }

  return sendError(res, error.statusCode || 500, error.message || 'Internal Server Error');
};

module.exports = errorHandler;
