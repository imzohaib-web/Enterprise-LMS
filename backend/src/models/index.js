'use strict';
const mongoose = require('mongoose');

const User = require('./User');
const Course = require('./Course');
const Category = require('./Category');
const Enrollment = require('./Enrollment');
const LearningPath = require('./LearningPath');
const RefreshToken = require('./RefreshToken');
const Certificate = require('../modules/certificates/certificate.model');
const Notification = require('../modules/notifications/notification.model');
const { QuizModel, QuizAttemptModel } = require('../modules/assessments/assessment.model');
const { DiscussionModel, ReplyModel } = require('../modules/discussions/discussion.model');
const { StudentProgressModel } = require('../modules/progress/progress.model');

module.exports = {
  User,
  Course,
  Category,
  Enrollment,
  LearningPath,
  RefreshToken,
  Certificate,
  Notification,
  Quiz: QuizModel,
  QuizAttempt: QuizAttemptModel,
  Discussion: DiscussionModel,
  Reply: ReplyModel,
  StudentProgress: StudentProgressModel,
  models: mongoose.models,
};
