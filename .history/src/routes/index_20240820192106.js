const roleRouter = require("./role");

function route(app) {
  app.use("/news", newsRouter);
  app.use("/", siteRouter);
  app.use("/course", courseRouter);
  app.use("/me", meRouter);
  app.use("role", roleRouter);
}

module.exports = route;
