const Blog = require("../models/Blog");
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Cloud = require("../../config/cloud/cloudinary.config");
const cloudinary = require("cloudinary").v2;
class BlogController {
  // [GET] /blog/:id - Lấy blog theo ID
  async getById(req, res) {
    try {
      const blog = await Blog.findOne({ _id: req.params.id });
      res.status(200).json({ success: !!blog, blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /blog - Lấy tất cả blog với các chức năng lọc, phân trang, sắp xếp
  async getAll(req, res) {
    try {
      const queries = { ...req.query };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((field) => delete queries[field]);

      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (match) => `$${match}`
      );
      const formattedQueries = JSON.parse(queryString);

      if (queries?.title) {
        formattedQueries.title = { $regex: queries.title, $options: "i" };
      }

      let queryCommand = Blog.find(formattedQueries);

      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      const page = +req.query.page || 1;
      const limit = +req.query.limit || process.env.LIMIT_BLOGS || 10;
      const skip = (page - 1) * limit;
      queryCommand = queryCommand.skip(skip).limit(limit);

      const blogs = await queryCommand.exec();
      const counts = await Blog.find(formattedQueries).countDocuments();

      res.status(200).json({
        success: blogs.length > 0,
        counts,
        blogs: blogs.length > 0 ? blogs : "No blogs found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [POST] /blog/store - Thêm mới blog
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
        const { title, content } = req.body;

        if (!title || !content) {
          return res
            .status(400)
            .json({ success: false, message: "Missing inputs" });
        }
        // Nếu có file ảnh, lưu URL vào req.body
        if (req.file && req.file.path) {
          req.body.image = req.file.path; // URL ảnh trên Cloudinary
        }
        const author = req.user._id;
        const blog = new Blog({
          ...req.body,
          author,
        });
        const savedBlog = await blog.save();

        res.status(200).json({
          success: true,
          message: "Blog created successfully",
          data: savedBlog,
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /blog/:id - Cập nhật blog
  async update(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của blog
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Kiểm tra nếu người dùng hiện tại là tác giả của blog
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to update this blog because just author can update",
        });
      }

      // Cập nhật blog
      const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /blog/:id - Xóa blog
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra sự tồn tại của blog
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Kiểm tra nếu người dùng hiện tại là tác giả của blog
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this blog",
        });
      }

      // Xóa blog
      await Blog.deleteOne({ _id: id });

      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [DELETE] /blog/:id/force - Xóa blog vĩnh viễn
  async forceDelete(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Kiểm tra nếu người dùng hiện tại là tác giả của blog
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to permanently delete this blog",
        });
      }

      // Xóa vĩnh viễn blog
      await Blog.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: "Blog permanently deleted",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [PATCH] /blog/:id/restore - Khôi phục blog đã xóa
  async restore(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Kiểm tra nếu người dùng hiện tại là tác giả của blog
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to restore this blog",
        });
      }

      // Khôi phục blog
      await Blog.restore({ _id: req.params.id });
      const restoredBlog = await Blog.findById(req.params.id);

      res.status(200).json({
        success: true,
        message: "Blog restored successfully",
        restoredBlog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  // [PATCH] /blog/:id/publish - Duyệt blog (xuất bản blog)
  async publish(req, res) {
    try {
      const { id } = req.params;

      const blog = await Blog.findByIdAndUpdate(
        id,
        { isPublished: true },
        { new: true }
      );

      if (!blog) {
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      }

      res.status(200).json({
        success: true,
        message: "Blog published successfully",
        blog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new BlogController();
