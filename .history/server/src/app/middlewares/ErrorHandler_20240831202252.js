const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} is not Found`);
  res.status(404);
  next(error);
};
// next(err) : sẽ tìm đến middleWare 4 tham số ( middleware để xử lý lỗi)

const errHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ success: false, message: error.message });
};
module.exports = {
  notFound,
  errHandler,
};
