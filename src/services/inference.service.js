/**
 * Mock inference for backend demo only (not real ML).
 * Random each call so behavior is obvious; no Python dependency.
 *
 * @param {string} videoPath - Absolute path to the uploaded video file (unused for mock).
 * @returns {Promise<{prediction: string, confidence: number}>}
 */
async function runInference(videoPath) {
  void videoPath;

  const prediction = Math.random() < 0.5 ? 'real' : 'fake';
  const confidence =
    Math.round((0.75 + Math.random() * 0.2) * 10000) / 10000;

  return {
    prediction,
    confidence,
  };
}

module.exports = {
  runInference,
};
