'use strict';
const Joi = require('joi');

const createCourse = Joi.object({
  title:       Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  shortDesc:   Joi.string().max(300),
  level:       Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  language:    Joi.string().max(50).default('English'),
  price:       Joi.number().min(0).default(0),
  isFree:      Joi.boolean().default(true),
  tags:        Joi.array().items(Joi.string().max(50)).max(20).default([]),
  category:    Joi.string().hex().length(24),
  prerequisites:     Joi.array().items(Joi.string().hex().length(24)).default([]),
  learningOutcomes:  Joi.array().items(Joi.string().max(200)).max(20).default([]),
  requirements:      Joi.array().items(Joi.string().max(200)).max(20).default([]),
});

const updateCourse = Joi.object({
  title:       Joi.string().trim().min(5).max(200),
  description: Joi.string().min(20).max(5000),
  shortDesc:   Joi.string().max(300).allow('', null),
  level:       Joi.string().valid('beginner', 'intermediate', 'advanced'),
  language:    Joi.string().max(50),
  price:       Joi.number().min(0),
  isFree:      Joi.boolean(),
  isFeatured:  Joi.boolean(),
  status:      Joi.string().valid('draft', 'published', 'archived', 'pending_approval', 'rejected'),
  tags:        Joi.array().items(Joi.string().max(50)).max(20),
  category:    Joi.string().hex().length(24).allow(null),
  prerequisites:    Joi.array().items(Joi.string().hex().length(24)),
  learningOutcomes: Joi.array().items(Joi.string().max(200)).max(20),
  requirements:     Joi.array().items(Joi.string().max(200)).max(20),
});

const listCourses = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(50).default(12),
  search:   Joi.string().trim().max(100),
  level:    Joi.string().valid('beginner', 'intermediate', 'advanced'),
  category: Joi.string().hex().length(24),
  status:   Joi.string().valid('draft', 'published', 'archived', 'pending_approval', 'rejected', 'all'),
  instructor: Joi.string().hex().length(24),
  isFree:   Joi.boolean(),
  isFeatured: Joi.boolean(),
  instructor: Joi.string().hex().length(24),
  isFree:   Joi.boolean(),
  sortBy:   Joi.string().valid('createdAt', 'enrollmentCount', 'averageRating', 'price').default('createdAt'),
  order:    Joi.string().valid('asc', 'desc').default('desc'),
});

const createSection = Joi.object({
  title:       Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().max(500).allow('', null),
  order:       Joi.number().integer().min(0).default(0),
});

const updateSection = Joi.object({
  title:       Joi.string().trim().min(2).max(200),
  description: Joi.string().max(500).allow('', null),
  order:       Joi.number().integer().min(0),
});

const createLesson = Joi.object({
  title:     Joi.string().trim().min(2).max(200).required(),
  type:      Joi.string().valid('video', 'pdf', 'text', 'assignment').required(),
  content:   Joi.string().max(50000),
  isPreview: Joi.boolean().default(false),
  order:     Joi.number().integer().min(0).default(0),
  duration:  Joi.number().min(0).default(0),
  resources: Joi.array().items(
    Joi.object({ name: Joi.string().required(), url: Joi.string().uri().required() })
  ).max(20).default([]),
});

const updateLesson = createLesson.fork(
  ['title', 'type'],
  (schema) => schema.optional()
);

module.exports = { createCourse, updateCourse, listCourses, createSection, updateSection, createLesson, updateLesson };
