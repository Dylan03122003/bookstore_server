export function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    return res.status(400).json({
      status: 'fail',
      message: 'Disallow duplicate values',
    });
  }

  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
  });
}
