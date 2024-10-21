const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Author = require("../models/Author");
const Product = require("../models/Product");
const Publisher = require("../models/Publisher");
const User = require("../models/User");
const Category = require("../models/Category");
const Cloud = require("../../config/cloud/cloudinary.config");

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

  // [POST] /product/store
  async store(req, res) {
    try {
      const { name, price, pageNumber, author, publisher, categories } =
        req.body;
      if (Object.keys(req.body).length === 0)
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });

      if (
        !name ||
        !price ||
        !pageNumber ||
        !author ||
        !publisher ||
        !categories
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      // Kiểm tra xem có tệp ảnh nào được upload hay không
      if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map((file) => file.path); // Lấy các URL hình ảnh từ Cloudinary
        req.body.images = uploadedImages; // Gán các URL hình ảnh vào trường images
      } else {
        throw new Error("Missing Input Images");
      }
      const product = new Product(req.body);
      const savedProduct = await product.save();

      // Trả về tài liệu đã lưu thành công
      res.status(200).json({
        success: true,
        message: "Create product successful",
        data: savedProduct,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }

  //[PUT] /product/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của tài liệu
      const check = await checkDocumentById(Product, id);

      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

      // Cập nhật product
      await Product.findByIdAndUpdate(id, req.body, { new: true });

      // Truy vấn lại product và populate categories, author, publisher
      const updatedProduct = await Product.findById(id)
        .populate("categories") // Populate thông tin category
        .populate("author") // Populate thông tin author nếu cần
        .populate("publisher"); // Populate thông tin publisher nếu cần

      res.status(200).json({
        success: true,
        message: "Product update successful",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }
  //[PUT] /product/:id
  async uploadImage(req, res) {
    try {
      Cloud.single("images")(req, res, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: err.message,
          });
        }

        // Trả về tài liệu đã lưu thành côn
        res.status(200).json({
          success: true,
          message: "Image upload successful",
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "An error occurred " + err });
    }
  }
  // [DELETE] /product/:id
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
