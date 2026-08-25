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

const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Upload a buffer to Cloudinary with automatic local disk fallback
 * @param {Buffer} buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary or local file upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Fall back to local disk storage if Cloudinary cloud_name is not configured
    if (!config.cloudinary.cloudName) {
      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const ext = options.resource_type === 'image' ? '.png' : options.resource_type === 'video' ? '.mp4' : '.pdf';
        const filename = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${filename}`;
        return resolve({
          secure_url: fileUrl,
          url: fileUrl,
          public_id: filename,
          duration: 0,
          format: ext.replace('.', ''),
        });
      } catch (err) {
        return reject(new AppError(`Local file save failed: ${err.message}`, 500));
      }
    }

    const cloudinaryOptions = { ...options };
    if (!cloudinaryOptions.resource_type) {
      cloudinaryOptions.resource_type = 'auto';
    }

    const isVideo = cloudinaryOptions.resource_type === 'video';
    if (isVideo && !cloudinaryOptions.chunk_size) {
      cloudinaryOptions.chunk_size = 6 * 1024 * 1024; // 6 MB chunks
    }

    const uploadMethod = isVideo
      ? cloudinary.uploader.upload_chunked_stream.bind(cloudinary.uploader)
      : cloudinary.uploader.upload_stream.bind(cloudinary.uploader);

    const stream = uploadMethod(
      cloudinaryOptions,
      (error, result) => {
        if (error) {
          // Fallback to local storage if Cloudinary fails
          console.warn('⚠️ Cloudinary upload error, saving locally fallback:', error.message);
          try {
            if (!fs.existsSync(UPLOADS_DIR)) {
              fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            }
            const ext = options.resource_type === 'image' ? '.png' : options.resource_type === 'video' ? '.mp4' : '.pdf';
            const filename = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
            const filePath = path.join(UPLOADS_DIR, filename);

            fs.writeFileSync(filePath, buffer);
            const fileUrl = `/uploads/${filename}`;
            return resolve({
              secure_url: fileUrl,
              url: fileUrl,
              public_id: filename,
              duration: 0,
              format: ext.replace('.', ''),
            });
          } catch (localErr) {
            return reject(new AppError(`Cloudinary & local upload failed: ${localErr.message}`, 500));
          }
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary or local disk
 * @param {string} publicId
 * @param {string} resourceType
 */
const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
  try {
    if (publicId && publicId.startsWith('file_')) {
      const localPath = path.join(UPLOADS_DIR, publicId);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return;
    }
    if (config.cloudinary.cloudName) {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    console.warn('⚠️ File delete failed:', err.message);
  }
};

module.exports = {
  videoUpload,
  documentUpload,
  imageUpload,
  uploadToCloudinary,
  deleteFromCloudinary,
};

