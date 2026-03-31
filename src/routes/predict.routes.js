const express = require('express');
const multer = require('multer');
const path = require('path');
const config = require('../config');
const predictController = require('../controllers/predict.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadsDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    cb(null, name + '-' + Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

router.post('/predict', (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    predictController.predict(req, res, err).catch(next);
  });
});

module.exports = router;
