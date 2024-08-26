const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} is not Found`);
  res.status(404);
  next(error);
};
