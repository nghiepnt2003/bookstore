const Blog = require("../models/Blog");
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");
const Cloud = require("../../config/cloud/cloudinary.config");
const User = require("../models/User");
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

  //[GET] /blog/related/:id
  async getRelatedBlogs(req, res) {
    try {
      const { id } = req.params;

      // Lấy thông tin của blog hiện tại
      const currentBlog = await Blog.findById(id).populate("categories tags");
      if (!currentBlog) {
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      }

      // Cấu hình các điều kiện để tìm các bài viết liên quan
      const relatedQuery = {
        _id: { $ne: id }, // Loại trừ blog hiện tại
        categories: { $in: currentBlog.categories }, // Lấy cùng categories
        tags: { $in: currentBlog.tags }, // Hoặc cùng tags
      };

      // Sử dụng logic từ `getAll`
      const { sort = "-views", limit = 5 } = req.query; // Default là sắp xếp theo lượt xem
      let queryCommand = Blog.find(relatedQuery);

      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      queryCommand = queryCommand.limit(Number(limit));

      // Thực thi query
      const relatedBlogs = await queryCommand.exec();

      res.status(200).json({
        success: true,
        relatedBlogs: relatedBlogs.length
          ? relatedBlogs
          : "No related blogs found",
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
        const author = req.user._id;
        // Nếu có file ảnh, lưu URL vào req.body
        if (req.file && req.file.path) {
          req.body.image = req.file.path; // URL ảnh trên Cloudinary
        }
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

        // Xử lý xóa ảnh cũ nếu có ảnh mới được upload
        if (req.file) {
          if (blog.image) {
            // Lấy public_id từ URL của ảnh hiện tại
            const publicId = blog.image.split("/").pop().split(".")[0];

            // Xóa ảnh cũ trên Cloudinary
            await cloudinary.uploader.destroy(`bookstore/${publicId}`);
          }

          // Lấy URL của ảnh mới từ Cloudinary
          req.body.image = req.file.path; // Lưu URL của ảnh mới
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
      await Blog.delete({ _id: id });

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
      const blog = await Blog.findOneDeleted({ _id: req.params.id });
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "this blog has not been deleted",
        });
      }
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission because you are not Author",
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
      const blog = await Blog.findOneDeleted({ _id: req.params.id });
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "this blog has not been deleted",
        });
      }
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission because you are not Author",
        });
      }
      await Blog.restore({ _id: req.params.id });
      const restoredBlog = await Blog.findById(req.params.id);
      // Kiểm tra sự tồn tại của tài liệu
      if (!restoredBlog) {
        return res.status(400).json({
          success: false,
          message: "Blog not found",
        });
      }
      console.log("Restored Blog:", restoredBlog);
      res.status(200).json({
        status: true,
        message: "Restored blog",
        restoredBlog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred : " + error,
      });
    }
  }

  // [PATCH] /blog/publish - Duyệt blog (xuất bản blog)
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

  // [PATCH] /blog/increateView/:id - Cập nhật view khi xem blog
  async increaseView(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra xem blog có tồn tại không
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Tăng số views lên 1
      blog.views += 1;
      await blog.save();

      res.status(200).json({
        success: true,
        message: "View count increased",
        views: blog.views,
        blog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }

  //[PATCH] /blog/bookmark/:id
  async bookmark(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user._id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (!user.bookmarks) {
        user.bookmarks = [];
      }
      const index = user.bookmarks.indexOf(id);
      if (index === -1) {
        user.bookmarks.push(id);
        await user.save();
        res
          .status(200)
          .json({ success: true, message: "Blog bookmarked", user });
      } else {
        user.bookmarks.splice(index, 1);
        await user.save();
        res
          .status(200)
          .json({ success: true, message: "Bookmark removed", user });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message,
      });
    }
  }
}

module.exports = new BlogController();
