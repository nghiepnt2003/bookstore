const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");
const publisherRouter = require("./publisher");
const productRouter = require("./product");
const userRouter = require("./user");
const cartRouter = require("./cart");
const orderRouter = require("./order");
const ratingRouter = require("./rating");
const commentRouter = require("./comment");
const discountRouter = require("./discount");
const messageRouter = require("./message");
const statictisRouter = require("./statictis");
const blogRouter = require("./blog");
const inventoryRouter = require("./inventory");

const { notFound, errHandler } = require("../app/middlewares/ErrorHandler");
function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
  app.use("/author", authorRouter);
  app.use("/publisher", publisherRouter);
  app.use("/product", productRouter);
  app.use("/user", userRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.use("/rating", ratingRouter);
  app.use("/comment", commentRouter);
  app.use("/discount", discountRouter);
  app.use("/message", messageRouter);
  app.use("/statictis", statictisRouter);
  app.use("/blog", blogRouter);
  app.use("/inventory", inventoryRouter);
  // Nếu không vào route nào thì là err Not found
  app.use(notFound);
  // Nếu có lỗi  ở bất kỳ route nào thì dưới này hứng nếu trên đó catch next(err)
  app.use(errHandler);
}

module.exports = route;
