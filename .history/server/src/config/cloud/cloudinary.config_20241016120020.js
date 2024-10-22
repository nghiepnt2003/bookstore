const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dl8p2amm8",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bookstore",
    allowed_formats: ["jpg", "png", "jpeg"], // Định dạng ảnh cho phép
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
