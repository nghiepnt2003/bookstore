const express = require("express");
const feedbackController = require("../app/controllers/FeedbackController");
const { verifyAccessToken } = require("../app/middlewares/jwt");
const router = express.Router();

router.post("/store", [verifyAccessToken], feedbackController.store);

module.exports = router;
