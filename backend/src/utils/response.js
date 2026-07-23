'use strict';

/**
 * Send a standardised success response
 * @param {import('express').Response} res
 * @param {object} opts
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardised error response
 * @param {import('express').Response} res
 * @param {object} opts
 */
const sendError = (res, { statusCode = 500, message = 'Internal server error', code = 'INTERNAL_ERROR', meta = null } = {}) => {
  const body = { success: false, message, code };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Build a pagination meta object
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { sendSuccess, sendError, paginationMeta };
