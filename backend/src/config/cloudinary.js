'use strict';
const cloudinary = require('cloudinary').v2;
const config = require('./env');

if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  console.log('☁️  Cloudinary configured');
} else {
  console.warn('⚠️  Cloudinary credentials not set – file upload will be disabled');
}

module.exports = cloudinary;
