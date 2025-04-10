const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");

class BlogService {
  async getBlogById(id) {
    return await Blog.findOne({ _id: id });
  }
  async getBlogsByUser(userId, options) {
    const query = { author: userId };

    let queryCommand = Blog.find(query);

    if (options.sort) {
      const sortBy = options.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    if (options.fields) {
      const fields = options.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    const skip = (options.page - 1) * options.limit;
    queryCommand = queryCommand.skip(skip).limit(options.limit);

    const blogs = await queryCommand.exec();
    const counts = await Blog.countDocuments(query);

    return { blogs, counts };
  }

  async getAllBlogs(queries, options) {
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

    if (options.sort) {
      const sortBy = options.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    if (options.fields) {
      const fields = options.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    const skip = (options.page - 1) * options.limit;
    queryCommand = queryCommand.skip(skip).limit(options.limit);

    const blogs = await queryCommand.exec();
    const counts = await Blog.find(formattedQueries).countDocuments();

    return { blogs, counts };
  }

  async getRelatedBlogs(id, categories, tags, options) {
    const relatedQuery = {
      _id: { $ne: id },
      categories: { $in: categories },
      tags: { $in: tags },
    };

    let queryCommand = Blog.find(relatedQuery);
    if (options.sort) {
      const sortBy = options.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    queryCommand = queryCommand.limit(Number(options.limit));
    return await queryCommand.exec();
  }

  async createBlog(data, filePath, authorId) {
    if (filePath) {
      data.image = filePath;
    }
    const blog = new Blog({
      ...data,
      author: authorId,
    });
    return await blog.save();
  }

  async updateBlog(id, data, filePath, currentBlog) {
    if (filePath && currentBlog.image) {
      const publicId = currentBlog.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`bookstore/${publicId}`);
      data.image = filePath;
    }
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBlog(id) {
    return await Blog.delete({ _id: id });
  }

  async forceDeleteBlog(id) {
    return await Blog.deleteOne({ _id: id });
  }

  async restoreBlog(id) {
    await Blog.restore({ _id: id });
    return await Blog.findById(id);
  }

  async publishBlog(id) {
    return await Blog.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    );
  }

  async increaseBlogView(id) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error("Blog not found");
    blog.views += 1;
    await blog.save();
    return blog;
  }

  async toggleBookmark(blogId, userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.bookmarks) user.bookmarks = [];
    const index = user.bookmarks.indexOf(blogId);
    if (index === -1) {
      user.bookmarks.push(blogId);
    } else {
      user.bookmarks.splice(index, 1);
    }
    await user.save();
    return index === -1 ? "Blog bookmarked" : "Bookmark removed";
  }
}

module.exports = new BlogService();
