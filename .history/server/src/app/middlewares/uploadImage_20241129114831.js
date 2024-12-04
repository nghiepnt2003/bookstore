// middlewares/uploadImage.js
const Cloud = require("../../config/cloud/cloudinary.config");

const uploadImageMiddleware = (req, res, next) => {
  Cloud.single("image")(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error uploading image",
        error: err.message,
      });
    }
    next();
  });
};

module.exports = uploadImageMiddleware;
