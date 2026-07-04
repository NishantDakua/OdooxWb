const { ZodError } = require('zod');

function errorMiddleware(err, req, res, next) {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;
