'use strict';
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const AppError = require('./AppError');

const ALLOWED_VIDEO_MIMETYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_DOC_MIMETYPES = ['application/pdf'];
const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;  // 500 MB
const MAX_DOC_SIZE   = 50  * 1024 * 1024;  // 50 MB
const MAX_IMAGE_SIZE = 5   * 1024 * 1024;  // 5 MB

/** Multer memory storage – we pipe the buffer to Cloudinary manually */
const memStorage = multer.memoryStorage();

const videoUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only video files are allowed', 400, 'INVALID_FILE_TYPE'));
  },
});

const documentUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOC_MIMETYPES.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only PDF files are allowed', 400, 'INVALID_FILE_TYPE'));
  },
});

const imageUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only image files are allowed', 400, 'INVALID_FILE_TYPE'));
  },
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', ...options },
      (error, result) => {
        if (error) return reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId
 * @param {string} resourceType
 */
const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('⚠️  Cloudinary delete failed:', err.message);
  }
};

module.exports = {
  videoUpload,
  documentUpload,
  imageUpload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
