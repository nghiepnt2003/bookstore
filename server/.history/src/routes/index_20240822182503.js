const roleRouter = require("./role");
const categoryRouter = require("./category");
const authorRouter = require("./author");

function route(app) {
  app.use("/role", roleRouter);
  app.use("/category", categoryRouter);
}

module.exports = route;
