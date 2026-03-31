const multer = require('multer');
const { runInference } = require('../services/inference.service');
const { unlinkQuietly } = require('../utils/file.utils');

/**
 * Handles upload outcomes + inference response for POST /api/predict.
 * Multer errors are received via the `err` argument from the route wrapper.
 */
async function predict(req, res, err) {
  if (err instanceof multer.MulterError) {
    console.log(err);
    const multerMessage =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : 'Upload error';
    return res.status(400).json({
      message: multerMessage,
    });
  }

  if (err) {
    return res.status(400).json({
      message: 'Upload error',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: 'No valid video file provided',
    });
  }

  const videoPath = req.file.path;

  try {
    // In demo mode this calls mock inference (no Python process).
    const inferenceResult = await runInference(videoPath);
    console.log('[POST /api/predict mock]', inferenceResult);
    return res
      .status(200)
      .set('Cache-Control', 'no-store')
      .json({
        message: 'Prediction successful',
        prediction: inferenceResult.prediction,
        confidence: inferenceResult.confidence,
      });
  } catch (e) {
    return res.status(500).json({
      message: 'Inference failed',
      prediction: null,
      confidence: null,
    });
  } finally {
    // Uploaded files are temporary; always attempt cleanup.
    unlinkQuietly(videoPath);
  }
}

module.exports = {
  predict,
};
