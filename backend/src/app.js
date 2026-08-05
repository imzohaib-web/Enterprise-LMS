'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

// Pre-load all Mongoose models
require('./models');

const config = require('./config/env');
const errorMiddleware = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// ── Route modules ────────────────────────────────────────────────────────────
const authRoutes         = require('./modules/auth/auth.routes');
const userRoutes         = require('./modules/users/user.routes');
const courseRoutes       = require('./modules/courses/course.routes');
const learningPathRoutes = require('./modules/learning-paths/learningPath.routes');
const adminRoutes        = require('./modules/admin/admin.routes');
const reportRoutes       = require('./modules/reports/report.routes');
const certificateRoutes  = require('./modules/certificates/certificate.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const discussionRoutes   = require('./modules/discussions/discussion.routes');
const assessmentRoutes   = require('./modules/assessments/assessment.routes');
const progressRoutes     = require('./modules/progress/progress.routes');

const app = express();

// ── Security & CORS ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.clientUrl || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'],
}));

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// ── Serve static uploaded files ───────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/v1', apiLimiter);

// ── Swagger ───────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise LMS API',
      version: '1.0.0',
      description: 'Enterprise LMS API Documentation',
    },
    servers: [{ url: `/api/v1`, description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/v1/docs.json', (req, res) => res.json(swaggerSpec));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Enterprise LMS API is running' });
});
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Enterprise LMS API is running', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',           authRoutes);
app.use('/api/v1/users',          userRoutes);
app.use('/api/v1/courses',        courseRoutes);
app.use('/api/v1/learning-paths', learningPathRoutes);
app.use('/api/v1/admin',          adminRoutes);
app.use('/api/v1/reports',        reportRoutes);
app.use('/api/v1/certificates',  certificateRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/discussions',   discussionRoutes);
app.use('/api/v1/assessments',   assessmentRoutes);
app.use('/api/v1/progress',      progressRoutes);
if (discussionRoutes.replyRouter) {
  app.use('/api/v1/replies', discussionRoutes.replyRouter);
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found`, code: 'NOT_FOUND' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
