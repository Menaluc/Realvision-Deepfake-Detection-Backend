// Centralized runtime settings used by server and upload pipeline.
module.exports = {
  port: process.env.PORT || 3000,
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  uploadsDir: 'uploads/',
};
