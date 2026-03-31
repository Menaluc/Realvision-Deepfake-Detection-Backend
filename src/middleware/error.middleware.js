/**
 * Basic centralized error handler (Express 4-arg middleware).
 */
function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Server error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = errorMiddleware;
