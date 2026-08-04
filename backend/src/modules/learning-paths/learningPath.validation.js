'use strict';
const Joi = require('joi');

const createLearningPath = Joi.object({
  title:       Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().max(2000),
  level:       Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  thumbnail:   Joi.string().uri().allow(null),
  tags:        Joi.array().items(Joi.string().max(50)).max(20).default([]),
  isPublished: Joi.boolean().default(false),
  courses:     Joi.array().items(
    Joi.object({
      course:     Joi.string().hex().length(24).required(),
      order:      Joi.number().integer().min(0).required(),
      isRequired: Joi.boolean().default(true),
    })
  ).default([]),
});

const updateLearningPath = createLearningPath.fork(
  ['title', 'level'],
  (s) => s.optional()
);

const listLearningPaths = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  search: Joi.string().max(100),
  isPublished: Joi.boolean(),
});

module.exports = { createLearningPath, updateLearningPath, listLearningPaths };
