const Author = require("../models/Author");
const Publisher = require("../models/Publisher");
const Category = require("../models/Category");
const User = require("../models/User");
const Product = require("../models/Product");

const validateReferencesProduct = async (req, res, next) => {
  try {
    const { author, publisher, categories } = req.body;
    if (author) {
      const authorExists = await Author.findById(author);
      if (!authorExists) {
        return res
          .status(400)
          .json({ success: false, message: "Author not found" });
      }
    }

    if (publisher) {
      const publisherExists = await Publisher.findById(publisher);
      if (!publisherExists) {
        return res
          .status(400)
          .json({ success: false, message: "Publisher not found" });
      }
    }
    if (categories && typeof categories === "string") {
      try {
        req.body.categories = JSON.parse(categories).map(Number);
      } catch (error) {
        req.body.categories = categories.split(",").map(Number);
      }
      for (let categoryId of req.body.categories) {
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message: `Category with ID ${categoryId} not found`,
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred" + error });
  }
};
const validateReferencesFeedback = async (req, res, next) => {
  try {
    const { user, product } = req.body;
    if (user) {
      const userExists = await User.findById(user);
      if (!userExists) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
    }

    if (product) {
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res
          .status(400)
          .json({ success: false, message: "Product not found" });
      }
    }
    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred" + error });
  }
};

module.exports = { validateReferencesProduct, validateReferencesFeedback };
