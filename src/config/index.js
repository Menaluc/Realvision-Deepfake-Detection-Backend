// Centralized runtime settings used by server and upload pipeline.
const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  // Resolve to repo root uploads directory so deployment working directory changes won't break Multer.
  uploadsDir: path.resolve(__dirname, '../../uploads'),
};
