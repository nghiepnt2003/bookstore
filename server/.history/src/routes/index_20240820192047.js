const newsRouter = require("./news");
const siteRouter = require("./site");
const courseRouter = require("./course");
const meRouter = require("./me");

const roleRouter = require("./role");

function route(app) {
  app.use("/news", newsRouter);
  app.use("/", siteRouter);
  app.use("/course", courseRouter);
  app.use("/me", meRouter);
}

module.exports = route;
