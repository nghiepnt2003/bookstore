const roleRouter = require("./role");

function route(app) {
  app.use("role", roleRouter);
}

module.exports = route;
