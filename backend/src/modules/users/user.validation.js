'use strict';
const Joi = require('joi');

const updateUser = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName:  Joi.string().trim().min(2).max(50),
  bio:       Joi.string().max(500).allow('', null),
  expertise: Joi.array().items(Joi.string()).max(20),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow('', null),
    github:   Joi.string().uri().allow('', null),
    website:  Joi.string().uri().allow('', null),
  }),
});

const listUsers = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  role:     Joi.string().valid('student', 'instructor', 'admin').allow('', null),
  search:   Joi.string().trim().max(100).allow('', null),
  isActive: Joi.boolean().allow('', null),
  sortBy:   Joi.string().valid('createdAt', 'firstName', 'email').default('createdAt'),
  order:    Joi.string().valid('asc', 'desc').default('desc'),
});

const updateStatus = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = { updateUser, listUsers, updateStatus };
