const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const certificateRoutes = require('./modules/certificates/certificate.routes');
const errorHandler = require('./middlewares/error.middleware');
const AppError = require('./utils/appError');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (e.g. generated PDF certificates)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Enterprise LMS API is running' });
});

// API Routes
app.use('/api/v1/certificates', certificateRoutes);

// Handle 404 routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
