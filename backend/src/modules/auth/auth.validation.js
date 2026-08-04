'use strict';
const Joi = require('joi');

const register = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  email:     Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password:  Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role:      Joi.string().valid('student', 'instructor', 'admin').default('student'),
});

const login = Joi.object({
  email:    Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password: Joi.string().required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

module.exports = { register, login, changePassword };
