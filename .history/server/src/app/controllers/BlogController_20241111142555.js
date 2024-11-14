const Blog = require("../models/Blog");
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");

class BlogController {
  // [GET] /blogs/:id - Lấy blog theo ID
  async getById(req, res) {
    try {
      const blog = await Blog.findOne({ _id: req.params.id });
      res.status(200).json({ success: !!blog, blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /blogs - Lấy tất cả blogs với các chức năng lọc, phân trang, sắp xếp
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

  // [POST] /blogs/store - Thêm mới blog
  async store(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Missing inputs" });
      }
      const author = req.user._id;
      const blog = new Blog(req.body);
      const savedBlog = await blog.save();

      res.status(200).json({
        success: true,
        message: "Blog created successfully",
        data: savedBlog,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // [PUT] /blogs/:id - Cập nhật blog
  async update(req, res) {
    try {
      const { id } = req.params;

      const check = await checkDocumentById(Blog, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }

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

  // [DELETE] /blogs/:id - Xóa blog mềm (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const check = await checkDocumentById(Blog, id);
      if (!check.exists) {
        return res.status(400).json({
          success: false,
          message: check.message,
        });
      }
      await Blog.delete({ _id: id });
      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // [DELETE] /blogs/:id/force - Xóa blog vĩnh viễn
  async forceDelete(req, res) {
    try {
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

  // [PATCH] /blogs/:id/restore - Khôi phục blog đã xóa
  async restore(req, res) {
    try {
      await Blog.restore({ _id: req.params.id });
      const restoredBlog = await Blog.findById(req.params.id);

      if (!restoredBlog) {
        return res.status(400).json({
          success: false,
          message: "Blog not found",
        });
      }
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

  // [PATCH] /blogs/:id/publish - Duyệt blog (xuất bản blog)
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
