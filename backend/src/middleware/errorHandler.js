/**
 * Global error-handling middleware.
 * Returns consistent JSON: { success: false, error: "<message>" }
 */
function errorHandler(err, _req, res, _next) {
  console.error(err.stack || err);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
