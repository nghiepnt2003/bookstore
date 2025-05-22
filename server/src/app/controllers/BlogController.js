const BlogService = require("../services/blogService");
const Cloud = require("../../config/cloud/cloudinary.config");

class BlogController {
  async getById(req, res) {
    try {
      const blog = await BlogService.getBlogById(req.params.id);
      res.status(200).json({ success: !!blog, blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const options = {
        sort: req.query.sort,
        fields: req.query.fields,
        page: +req.query.page || 1,
        limit: +req.query.limit || process.env.LIMIT_BLOGS || 10,
      };
      const { blogs, counts } = await BlogService.getAllBlogs(
        req.query,
        options
      );
      res.status(200).json({
        success: blogs.length > 0,
        counts,
        blogs: blogs.length > 0 ? blogs : "No blogs found",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async getByUser(req, res) {
    try {
      const options = {
        sort: req.query.sort,
        fields: req.query.fields,
        page: +req.query.page || 1,
        limit: +req.query.limit || process.env.LIMIT_BLOGS || 100,
      };

      const userId = req.user._id;
      if (!userId)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const { blogs, counts } = await BlogService.getBlogsByUser(
        userId,
        options
      );

      res.status(200).json({
        success: blogs.length > 0,
        counts,
        blogs: blogs.length > 0 ? blogs : "No blogs found for this user",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRelatedBlogs(req, res) {
    try {
      const { id } = req.params;
      const currentBlog = await BlogService.getBlogById(id);
      if (!currentBlog) {
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      }
      const { sort = "-views", limit = 5 } = req.query;
      const relatedBlogs = await BlogService.getRelatedBlogs(
        id,
        currentBlog.categories,
        currentBlog.tags,
        { sort, limit }
      );
      res.status(200).json({ success: true, relatedBlogs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async store(req, res) {
    Cloud.single("image")(req, res, async (err) => {
      try {
        if (err) throw new Error(err.message);
        const savedBlog = await BlogService.createBlog(
          req.body,
          req.file?.path,
          req.user._id
        );
        res.status(200).json({
          success: true,
          message: "Blog created successfully",
          data: savedBlog,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }

  async update(req, res) {
    Cloud.single("image")(req, res, async (err) => {
      try {
        if (err) throw new Error(err.message);
        const currentBlog = await BlogService.getBlogById(req.params.id);
        if (!currentBlog) {
          return res
            .status(404)
            .json({ success: false, message: "Blog not found" });
        }
        // ✅ Kiểm tra nếu user hiện tại không phải là author
        if (currentBlog.author.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: "You are not allowed to update this blog",
          });
        }
        const updatedBlog = await BlogService.updateBlog(
          req.params.id,
          req.body,
          req.file?.path,
          currentBlog
        );
        res.status(200).json({
          success: true,
          message: "Blog updated successfully",
          data: updatedBlog,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }

  async delete(req, res) {
    try {
      await BlogService.deleteBlog(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async forceDelete(req, res) {
    try {
      await BlogService.forceDeleteBlog(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Blog permanently deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async restore(req, res) {
    try {
      const restoredBlog = await BlogService.restoreBlog(req.params.id);
      res.status(200).json({
        success: true,
        message: "Blog restored successfully",
        restoredBlog,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async publish(req, res) {
    try {
      const blog = await BlogService.publishBlog(req.params.id);
      res.status(200).json({
        success: true,
        message: "Blog published successfully",
        blog,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async increaseView(req, res) {
    try {
      const blog = await BlogService.increaseBlogView(req.params.id);
      res.status(200).json({
        success: true,
        message: "View count increased",
        views: blog.views,
        blog,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bookmark(req, res) {
    try {
      const message = await BlogService.toggleBookmark(
        req.params.id,
        req.user._id
      );
      res.status(200).json({ success: true, message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BlogController();
