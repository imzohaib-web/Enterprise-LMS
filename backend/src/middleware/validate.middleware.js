'use strict';
const AppError = require('../utils/AppError');

/**
 * Joi schema validation middleware factory
 * @param {import('joi').Schema} schema
 * @param {'body'|'query'|'params'} target
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const meta = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(AppError.badRequest('Validation failed', meta));
  }

  if (target === 'query') {
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, value);
  } else {
    req[target] = value;
  }
  next();
};

module.exports = validate;
