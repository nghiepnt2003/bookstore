const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Author = require("../models/Author");
const Product = require("../models/Product");
const Publisher = require("../models/Publisher");
const User = require("../models/User");
const Category = require("../models/Category");
const LineItem = require("../models/LineItem");

const Order = require("../models/Order");
const Cloud = require("../../config/cloud/cloudinary.config");
const cloudinary = require("cloudinary").v2;
class ProductController {
  //[GET] /product/:id
  async getById(req, res) {
    try {
      let product = await Product.findOne({ _id: req.params.id })
        .populate("categories") // Populate thông tin của các category
        .populate("author") // Populate thông tin của author nếu cần
        .populate("publisher"); // Populate thông tin của publisher nếu cần

      res.status(200).json({ success: product ? true : false, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }

  //[GET] /product/
  async getProducts(req, res) {
    // khi truyền  `product/price[gt]=5000&price[gte]=3000`
    // có nghĩa là truyền một object :  price: { gt:5000, gte:3000 }
    // Đây là cách truyền một object vào trong req.query
    try {
      const queries = { ...req.query };
      // Tách các trường đặc biệt ra khỏi query
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc theo tên tác giả nếu có
      if (queries.authorName) {
        const authors = await Author.find({
          name: { $regex: queries.authorName, $options: "i" },
        }).select("_id");
        const authorIds = authors.map((author) => author._id); // Thực hiện map để lấy ObjectId
        console.log("Author IDs:", authorIds);
        if (authorIds.length > 0) {
          formatedQueries.author = { $in: authorIds };
        }
        delete formatedQueries.authorName;
      }
      // Lọc theo tên category nếu có
      if (queries.categoryName) {
        const categories = await Category.find({
          name: { $regex: queries.categoryName, $options: "i" },
        }).select("_id");
        const categoryIds = categories.map((category) => category._id); // Thực hiện map để lấy ObjectId
        if (categoryIds.length > 0) {
          formatedQueries.categories = { $in: categoryIds };
        }
        delete formatedQueries.categoryName;
      }

      // Lọc theo tên nhà xuất bản nếu có
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        console.log("Publisher ID:", publisher ? publisher._id : null);
        if (publisher) {
          formatedQueries.publisher = publisher._id; // Gán trực tiếp ID của publisher
        }
        delete formatedQueries.publisherName;
      }

      // Execute query
      let queryCommand = Product.find(formatedQueries)
        .populate("categories") // Populate thông tin category
        .populate("author") // Populate thông tin author nếu cần
        .populate("publisher"); // Populate thông tin publisher nếu cần

      // Sorting
      if (req.query.sort) {
        // abc,exg => [abc,exg] => "abc exg"
        const sortBy = req.query.sort.split(",").join(" ");
        // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      //Pagination
      // limit: số docs lấy về 1 lần gọi API
      // skip:
      // Dấu + nằm trước số để chuyển sang số
      // +'2' => 2
      // +'asdasd' => NaN
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        products: response.length > 0 ? response : "Cannot get products",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // [GET] /product/suggest
  async suggestProducts(req, res) {
    try {
      const userId = req.user._id; // Lấy user từ token
      const user = await User.findById(userId).populate("wishList");

      const wishListProductIds = user.wishList.map((product) => product._id);

      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc theo tên tác giả nếu có
      if (queries.authorName) {
        const authors = await Author.find({
          name: { $regex: queries.authorName, $options: "i" },
        }).select("_id");
        const authorIds = authors.map((author) => author._id);
        if (authorIds.length > 0) {
          formatedQueries.author = { $in: authorIds };
        }
        delete formatedQueries.authorName;
      }

      // Lọc theo tên category nếu có
      if (queries.categoryName) {
        const categories = await Category.find({
          name: { $regex: queries.categoryName, $options: "i" },
        }).select("_id");
        const categoryIds = categories.map((category) => category._id);
        if (categoryIds.length > 0) {
          formatedQueries.categories = { $in: categoryIds };
        }
        delete formatedQueries.categoryName;
      }

      // Lọc theo tên nhà xuất bản nếu có
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
        delete formatedQueries.publisherName;
      }

      // Thêm điều kiện lọc theo danh mục sản phẩm trong wishlist của user
      formatedQueries.categories = {
        $in: user.wishList.flatMap((product) => product.categories),
      };

      // Loại bỏ các sản phẩm đã có trong wishlist
      formatedQueries._id = { $nin: wishListProductIds };

      // Execute query
      let queryCommand = Product.find(formatedQueries)
        .populate("categories")
        .populate("author")
        .populate("publisher");

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm gợi ý
      const response = await queryCommand.exec();

      // Lấy số lượng sản phẩm gợi ý
      const counts = await Product.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        suggestedProducts:
          response.length > 0 ? response : "No suggested products found",
      });
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
      const userId = req.user._id;
      const user = await User.findById(userId).populate("wishList");

      const wishListCategoryIds = user.wishList.flatMap(
        (product) => product.categories
      );

      // Copy query từ req.query để sử dụng cho việc lọc
      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queries[el]);

      // Format lại các operators cho đúng cú pháp mongoose (gte, lte, gt, lt)
      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Lọc theo tên sản phẩm nếu có
      if (queries.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Lọc theo tên tác giả nếu có
      if (queries.authorName) {
        const authors = await Author.find({
          name: { $regex: queries.authorName, $options: "i" },
        }).select("_id");
        const authorIds = authors.map((author) => author._id);
        if (authorIds.length > 0) {
          formatedQueries.author = { $in: authorIds };
        }
        delete formatedQueries.authorName;
      }

      // Lọc theo tên category nếu có
      if (queries.categoryName) {
        const categories = await Category.find({
          name: { $regex: queries.categoryName, $options: "i" },
        }).select("_id");
        const categoryIds = categories.map((category) => category._id);
        if (categoryIds.length > 0) {
          formatedQueries.categories = { $in: categoryIds };
        }
        delete formatedQueries.categoryName;
      }

      // Lọc theo nhà xuất bản nếu có
      if (queries.publisherName) {
        const publisher = await Publisher.findOne({
          name: { $regex: queries.publisherName, $options: "i" },
        }).select("_id");
        if (publisher) {
          formatedQueries.publisher = publisher._id;
        }
        delete formatedQueries.publisherName;
      }

      // Thêm điều kiện lọc theo danh mục sản phẩm trong wishlist của user
      formatedQueries.categories = { $in: wishListCategoryIds };

      // Thực hiện truy vấn sản phẩm dựa trên các tiêu chí lọc
      let queryCommand = Product.find(formatedQueries)
        .sort({ soldCount: -1, averageRating: -1 }) // Sắp xếp theo số lượng bán và điểm số đánh giá
        .populate("author categories publisher");

      // Sắp xếp theo trường khác nếu có
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Giới hạn các field trả về
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +req.query.page || 1;
      const limit = +req.query.limit || 10;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      // Lấy danh sách sản phẩm phổ biến
      const response = await queryCommand.exec();

      // Lấy tổng số lượng sản phẩm
      const counts = await Product.find(formatedQueries).countDocuments();

      res.status(200).json({
        success: response.length > 0,
        counts,
        popularProducts:
          response.length > 0 ? response : "No popular products found",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // [GET] /products/top-sellers?month=&year=
  // async topSellingProducts(req, res) {
  //   try {
  //     const { month, year } = req.query;

  //     if (!month || !year) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Month and year are required.",
  //       });
  //     }

  //     // Chuyển đổi month và year thành dạng ngày bắt đầu và kết thúc của tháng
  //     const startDate = new Date(year, month - 1, 1); // Ngày đầu tháng
  //     const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

  //     // Tìm các đơn hàng đã thành công trong tháng đó
  //     const orders = await Order.find({
  //       date: { $gte: startDate, $lte: endDate },
  //       status: "Successed", // Chỉ lấy đơn hàng đã thành công
  //     }).populate("details");

  //     // Tính toán tổng số lượng bán cho mỗi sản phẩm
  //     const productSales = {};

  //     orders.forEach((order) => {
  //       order.details.forEach((detail) => {
  //         const { productId, quantity } = detail;

  //         // Nếu sản phẩm đã tồn tại trong productSales thì cộng thêm số lượng
  //         if (productSales[productId]) {
  //           productSales[productId].quantity += quantity;
  //         } else {
  //           productSales[productId] = {
  //             productId,
  //             quantity,
  //           };
  //         }
  //       });
  //     });

  //     // Chuyển đổi productSales thành mảng và sắp xếp theo số lượng bán
  //     const topProducts = Object.values(productSales)
  //       .sort((a, b) => b.quantity - a.quantity) // Sắp xếp theo số lượng giảm dần
  //       .slice(0, 5); // Lấy 5 sản phẩm bán chạy nhất

  //     return res.status(200).json({
  //       success: true,
  //       topProducts,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

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
        const {
          name,
          price,
          costPrice,
          pageNumber,
          author,
          publisher,
          categories,
        } = req.body;
        if (Object.keys(req.body).length === 0)
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });

        if (
          !name ||
          !price ||
          !costPrice ||
          !pageNumber ||
          !author ||
          !publisher ||
          !categories
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });
        }

        // Kiểm tra costPrice < price
        if (costPrice >= price) {
          return res.status(400).json({
            success: false,
            message: "Cost price must be smaller than the selling price.",
          });
        }

        // Nếu có file ảnh, lưu URL vào req.body
        if (req.file && req.file.path) {
          req.body.image = req.file.path; // URL ảnh trên Cloudinary
        }
        const product = new Product(req.body);
        const savedProduct = await product.save();

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
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }

        const { id } = req.params;

        // Kiểm tra sự tồn tại của sản phẩm
        const check = await checkDocumentById(Product, id);
        if (!check.exists) {
          return res.status(400).json({
            success: false,
            message: check.message,
          });
        }

        // Lấy sản phẩm hiện tại
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Kiểm tra costPrice < price nếu có cập nhật
        if (
          req.body.costPrice &&
          req.body.price &&
          req.body.costPrice >= req.body.price
        ) {
          return res.status(400).json({
            success: false,
            message: "Cost price must be smaller than the selling price.",
          });
        }

        // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
        if (req.file) {
          if (existingProduct.image) {
            // Lấy public_id từ URL của ảnh hiện tại
            const publicId = existingProduct.image
              .split("/")
              .pop()
              .split(".")[0];

            // Xóa ảnh cũ trên Cloudinary
            await cloudinary.uploader.destroy(`bookstore/${publicId}`);
          }

          // Lấy URL của ảnh mới từ Cloudinary
          req.body.image = req.file.path; // Lưu URL của ảnh mới
        }

        // Cập nhật sản phẩm
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
          new: true,
        })
          .populate("categories")
          .populate("author")
          .populate("publisher");

        res.status(200).json({
          success: true,
          message: "Product update successful",
          data: updatedProduct,
        });
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
      const check = await checkDocumentById(Product, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Tìm tất cả LineItems liên kết với Product và set product = null
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa mềm product
      await Product.delete({ _id: id });

      res.status(200).json({
        success: true,
        message: "Delete successful, LineItems updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error,
      });
    }
  }

  // [DELETE] /product/:id/force
  async forceDelete(req, res, next) {
    try {
      const { id } = req.params;

      // Tìm tất cả LineItems liên kết với Product và set product = null
      await LineItem.updateMany({ product: id }, { product: null });

      // Xóa vĩnh viễn product
      await Product.deleteOne({ _id: id });

      res.status(200).json({
        success: true,
        message: "Force delete successful, LineItems updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error,
      });
    }
  }

  // [PATCH] /product/:id/restore
  async restore(req, res, next) {
    try {
      await Product.restore({ _id: req.params.id });
      const restoredProduct = await Product.findById(req.params.id);
      if (!restoredProduct) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Restored Product",
        restoredProduct,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred " + error,
      });
    }
  }
}

module.exports = new ProductController();
