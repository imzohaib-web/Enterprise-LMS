const { z } = require('zod');

// Regex for standard MongoDB ObjectId validation (24 hex characters)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const generateCertificateParamsSchema = z.object({
  courseId: objectIdSchema,
});

const getCertificateByIdParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  generateCertificateParamsSchema,
  getCertificateByIdParamsSchema,
};
