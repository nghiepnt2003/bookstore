const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");
const publisherRouter = require("./publisher");
const productRouter = require("./product");
const userRouter = require("./user");
const { notFound, errHandler } = require("../app/middlewares/ErrorHandler");
function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
  app.use("/author", authorRouter);
  app.use("/publisher", publisherRouter);
  app.use("/product", productRouter);
  app.use("/user", userRouter);
  // Nếu không vào route nào thì là err Not found
  app.use(notFound);
  // Nếu có lỗi  ở bất kỳ route nào thì dưới này hứng nếu trên đó catch next(err)
  app.use(errHandler);
}

module.exports = route;
