const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const predictController = require('../controllers/predict.controller');

// Route-level upload setup: validates file type/size before controller logic runs.
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadsDir);
  },

  // Filename is generated, not derived from user input, to avoid unsafe/predictable paths.
  // fileFilter runs before this and already validated the extension is allowed.
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedMimetype = file.mimetype.startsWith('video/');
  const isAllowedExtension = config.allowedExtensions.includes(ext);

  cb(null, isAllowedMimetype && isAllowedExtension);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// Multer is invoked inline to capture upload errors and pass them to the controller.
router.post('/predict', (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    predictController.predict(req, res, err).catch(next);
  });
});

module.exports = router;
