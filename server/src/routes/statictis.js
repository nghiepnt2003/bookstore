const express = require("express");
const statictisController = require("../app/controllers/StatictisController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();
router.get("/top-sellers", statictisController.topSellingProducts);
router.get(
  "/totalByMonth",
  [verifyAccessToken],
  statictisController.totalByMonth
);

module.exports = router;
