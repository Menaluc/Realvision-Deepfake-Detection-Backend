const fs = require('fs');

/**
 * Delete a file without throwing; logs on failure.
 * @param {string} filePath
 */
function unlinkQuietly(filePath) {
  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) console.error('Failed to delete temp file:', unlinkErr.message);
  });
}

module.exports = {
  unlinkQuietly,
};
