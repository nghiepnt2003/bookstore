const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");
const publisherRouter = require("./publisher");
const productRouter = require("./product");
const userRouter = require("./user");
const { notFound } = require("../app/middlewares/ErrorHandler");
function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
  app.use("/author", authorRouter);
  app.use("/publisher", publisherRouter);
  app.use("/product", productRouter);
  app.use("/user", userRouter);
  app.use(notFound);
}

module.exports = route;
