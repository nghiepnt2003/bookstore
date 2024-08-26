const roleRouter = require("./role");
const categoryRouter = require("./category");

function route(app) {
  app.use("/role", roleRouter);
}

module.exports = route;
