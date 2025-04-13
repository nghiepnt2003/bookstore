const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Author = require("../models/Author");
const Product = require("../models/Product");
const Publisher = require("../models/Publisher");
const User = require("../models/User");
const Category = require("../models/Category");
const LineItem = require("../models/LineItem");

const Order = require("../models/Order");
const Cloud = require("../../config/cloud/cloudinary.config");
const productService = require("../services/productService");
const cloudinary = require("cloudinary").v2;
class ProductController {
  //[GET] /product/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.getById(id);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //[GET] /product/
  async getProducts(req, res) {
    try {
      const queries = { ...req.query };

      // Tách các giá trị đặc biệt
      const { limit, sort, page, fields, ...filterQueries } = queries;

      const { response, counts } = await productService.getProducts({
        filterQueries,
        limit,
        sort,
        page,
        fields,
      });

      res.status(200).json({
        success: response.length > 0,
        counts,
        products: response.length > 0 ? response : "Cannot get products",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // async getProducts(req, res) {
  //   // khi truyền  `product/price[gt]=5000&price[gte]=3000`
  //   // có nghĩa là truyền một object :  price: { gt:5000, gte:3000 }
  //   // Đây là cách truyền một object vào trong req.query
  //   try {
  //     const queries = { ...req.query };
  //     // Tách các trường đặc biệt ra khỏi query
  //     const excludeFields = ["limit", "sort", "page", "fields"];
  //     excludeFields.forEach((el) => delete queries[el]);
  //     // Format lại các operators cho đúng cú pháp mongoose
  //     let queryString = JSON.stringify(queries);
  //     queryString = queryString.replace(
  //       /\b(gte|gt|lt|lte)\b/g,
  //       (matchedEl) => `$${matchedEl}`
  //     );
  //     const formatedQueries = JSON.parse(queryString);

  //     // Filtering
  //     if (queries?.name) {
  //       formatedQueries.name = { $regex: queries.name, $options: "i" };
  //     }

  //     // Lọc theo tên tác giả nếu có
  //     if (queries.authorName) {
  //       const authors = await Author.find({
  //         name: { $regex: queries.authorName, $options: "i" },
  //       }).select("_id");
  //       const authorIds = authors.map((author) => author._id); // Thực hiện map để lấy ObjectId
  //       console.log("Author IDs:", authorIds);
  //       if (authorIds.length > 0) {
  //         formatedQueries.author = { $in: authorIds };
  //       }
  //       delete formatedQueries.authorName;
  //     }
  //     // Lọc theo tên category nếu có
  //     if (queries.categoryName) {
  //       const categories = await Category.find({
  //         name: { $regex: queries.categoryName, $options: "i" },
  //       }).select("_id");
  //       const categoryIds = categories.map((category) => category._id); // Thực hiện map để lấy ObjectId
  //       if (categoryIds.length > 0) {
  //         formatedQueries.categories = { $in: categoryIds };
  //       }
  //       delete formatedQueries.categoryName;
  //     }

  //     // Lọc theo tên nhà xuất bản nếu có
  //     if (queries.publisherName) {
  //       const publisher = await Publisher.findOne({
  //         name: { $regex: queries.publisherName, $options: "i" },
  //       }).select("_id");
  //       console.log("Publisher ID:", publisher ? publisher._id : null);
  //       if (publisher) {
  //         formatedQueries.publisher = publisher._id; // Gán trực tiếp ID của publisher
  //       }
  //       delete formatedQueries.publisherName;
  //     }

  //     // Execute query
  //     let queryCommand = Product.find(formatedQueries)
  //       .populate("categories") // Populate thông tin category
  //       .populate("author") // Populate thông tin author nếu cần
  //       .populate("publisher"); // Populate thông tin publisher nếu cần

  //     // Sorting
  //     if (req.query.sort) {
  //       // abc,exg => [abc,exg] => "abc exg"
  //       const sortBy = req.query.sort.split(",").join(" ");
  //       // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
  //       queryCommand = queryCommand.sort(sortBy);
  //     }

  //     // fields limiting
  //     if (req.query.fields) {
  //       const fields = req.query.fields.split(",").join(" ");
  //       queryCommand = queryCommand.select(fields);
  //     }

  //     //Pagination
  //     // limit: số docs lấy về 1 lần gọi API
  //     // skip:
  //     // Dấu + nằm trước số để chuyển sang số
  //     // +'2' => 2
  //     // +'asdasd' => NaN
  //     const page = +req.query.page || 1;
  //     const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  //     const skip = (page - 1) * limit;
  //     queryCommand.skip(skip).limit(limit);

  //     // Lấy danh sách sản phẩm
  //     const response = await queryCommand.exec();

  //     // Lấy số lượng sản phẩm
  //     const counts = await Product.find(formatedQueries).countDocuments();

  //     res.status(200).json({
  //       success: response.length > 0,
  //       counts,
  //       products: response.length > 0 ? response : "Cannot get products",
  //     });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // }

  // [GET] /product/suggest
  async suggestProducts(req, res) {
    try {
      const userId = req.user._id; // Lấy user từ token
      const queries = { ...req.query };

      const response = await productService.suggestProducts(userId, queries);

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[GET] /product/suggestPopular
  async suggestPopularProducts(req, res) {
    try {
      const userId = req.user._id; // Lấy user từ token
      const queries = { ...req.query };

      const response = await productService.suggestPopularProducts(
        userId,
        queries
      );

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //[GET] /product/discount
  async getProductsWithDiscount(req, res) {
    try {
      const queries = { ...req.query };
      const { products, counts } = await productService.getProductsWithDiscount(
        queries
      );

      res.status(200).json({
        success: products.length > 0,
        counts,
        products:
          products.length > 0 ? products : "No discounted products found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /products/discount/:discountId
  async getProductsWithDiscountId(req, res) {
    try {
      const { discountId } = req.params;
      if (!discountId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing discount ID" });
      }

      const queries = { ...req.query };
      const { products, counts } =
        await productService.getProductsWithDiscountId(discountId, queries);

      res.status(200).json({
        success: products.length > 0,
        counts,
        products:
          products.length > 0 ? products : "No discounted products found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /product/store
  async store(req, res) {
    try {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }
        const savedProduct = await productService.createProduct(
          req.body,
          req.file?.path
        );
        // Trả về tài liệu đã lưu thành công
        res.status(200).json({
          success: true,
          message: "Create product successful",
          data: savedProduct,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  async update(req, res, next) {
    try {
      Cloud.single("image")(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }

        const { id } = req.params;

        // Kiểm tra sự tồn tại của sản phẩm
        const check = await productService.checkDocumentById(Product, id);
        if (!check.exists) {
          return res.status(400).json({
            success: false,
            message: check.message,
          });
        }

        try {
          const updatedProduct = await productService.updateProduct(
            id,
            req.body,
            req.file
          );

          res.status(200).json({
            success: true,
            message: "Product update successful",
            data: updatedProduct,
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để xử lý xóa Product
      try {
        const response = await productService.deleteProduct(id);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /product/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để xử lý xóa vĩnh viễn Product
      try {
        const response = await productService.forceDeleteProduct(id);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [PATCH] /product/:id/restore
  async restore(req, res, next) {
    try {
      const { id } = req.params;

      // Gọi service để khôi phục sản phẩm
      try {
        const restoredProduct = await productService.restoreProduct(id);
        res.status(200).json({
          success: true,
          message: "Restored Product",
          restoredProduct,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // async getRecommendedProducts(req, res) {
  //   try {
  //     const { uid } = req.params;
  //     console.log(`DEDE     ${process.env.RECOMMENDATION_SERVER}/${uid}`)
  //     const rs = await fetch(`${process.env.RECOMMENDATION_SERVER}/${uid}`);
  //     const productIds = await rs.json();
  //     console.log("KQ AI " + productIds);

  //     const products = await Product.find({ _id: { $in: productIds } })
  //       // .populate('brand', 'brandName -_id')
  //       // .populate('category', 'categoryName');

  //     console.log("KQ NE PRODUCT " + JSON.stringify(products))

  //     return res.status(200).json({
  //       success: true,
  //       products,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(400).json({
  //       success: false,
  //       message: "Error when getting recommendations: " + error.message,
  //     });
  //   }
  // }
  async getRecommendedProducts(req, res) {
    try {
      const uid = req.user._id;
      if (!uid)
        return res.status(404).json({
          success: false,
          message: "User not found: " + error.message,
        });
      console.log(`DEDE     ${process.env.RECOMMENDATION_SERVER}/${uid}`);
      const rs = await fetch(`${process.env.RECOMMENDATION_SERVER}/${uid}`);
      const productIds = await rs.json();
      console.log("KQ AI " + productIds);

      const products = await Product.find({ _id: { $in: productIds } })
        .populate("categories")
        .populate("author")
        .populate("publisher")
        .populate({
          path: "discount",
          match: {
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
          },
          select: "discountPercentage startDate endDate",
        });

      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          if (!product) return null;
          const finalPrice = await product.getFinalPrice();
          let timeRemaining = null;
          if (product.discount && product.discount?.endDate) {
            timeRemaining =
              product.discount.endDate.getTime() - new Date().getTime();
            if (timeRemaining <= 0) timeRemaining = 0;
          }

          return {
            ...product.toObject(),
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            timeRemaining,
          };
        })
      );

      return res.status(200).json({
        success: true,
        products: enrichedProducts,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        message: "Error when getting recommendations: " + error.message,
      });
    }
  }
}

module.exports = new ProductController();
