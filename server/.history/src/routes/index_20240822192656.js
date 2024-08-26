const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");
const publisherRouter = require("./publisher");

function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
  app.use("/author", authorRouter);
}

module.exports = route;
