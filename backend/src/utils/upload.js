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

const ALLOWED_RESOURCE_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/octet-stream',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
];

const resourceUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const validExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar', '.txt', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.mov'];
    if (ALLOWED_RESOURCE_MIMETYPES.includes(file.mimetype) || validExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file type for resource upload', 400, 'INVALID_FILE_TYPE'));
    }
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
    const origName = options.filename || options.originalname || '';
    const detectedExt = origName ? path.extname(origName).toLowerCase() : '';
    const ext = detectedExt || (options.resource_type === 'image' ? '.png' : options.resource_type === 'video' ? '.mp4' : '.pdf');
    const port = process.env.PORT || 5000;
    const serverBase = (process.env.SERVER_URL || process.env.BACKEND_URL || `http://localhost:${port}`).replace(/\/$/, '');

    const saveLocally = () => {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const cleanBase = origName ? path.basename(origName, detectedExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) : 'file';
      const filename = `file_${Date.now()}_${cleanBase}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, buffer);
      const fullUrl = `${serverBase}/uploads/${filename}`;
      return {
        secure_url: fullUrl,
        url: fullUrl,
        public_id: filename,
        duration: 0,
        format: ext.replace('.', ''),
      };
    };

    // Fall back to local disk storage if Cloudinary cloud_name is not configured
    if (!config.cloudinary.cloudName) {
      try {
        return resolve(saveLocally());
      } catch (err) {
        return reject(new AppError(`Local file save failed: ${err.message}`, 500));
      }
    }

    const cloudinaryOptions = { ...options };
    if (!cloudinaryOptions.resource_type) {
      cloudinaryOptions.resource_type = 'auto';
    }

    // Preserve extension in Cloudinary public_id for raw files so Cloudinary sets correct Content-Type header
    if (cloudinaryOptions.resource_type === 'raw' && !cloudinaryOptions.public_id && origName) {
      const cleanBase = path.basename(origName, detectedExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      cloudinaryOptions.public_id = `${cleanBase}_${Date.now()}${detectedExt}`;
    }

    const stream = cloudinary.uploader.upload_stream(
      cloudinaryOptions,
      (error, result) => {
        if (error) {
          console.warn('⚠️ Cloudinary upload error, saving locally fallback:', error.message);
          try {
            return resolve(saveLocally());
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
  resourceUpload,
  imageUpload,
  uploadToCloudinary,
  deleteFromCloudinary,
};

