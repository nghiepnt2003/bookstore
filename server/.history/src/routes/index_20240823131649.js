const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");
const publisherRouter = require("./publisher");
const productRouter = require("./product");

function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
  app.use("/author", authorRouter);
  app.use("/publisher", publisherRouter);
}

module.exports = route;
