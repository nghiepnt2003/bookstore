const Author = require("../models/Author");
const cloudinary = require("cloudinary").v2;

class AuthorService {
  async getAuthorById(id) {
    try {
      return await Author.findOne({ _id: id });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllAuthors(queries, options) {
    try {
      const { page, limit, sort, fields } = options;

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

      // Filtering by name with regex
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Query command
      let queryCommand = Author.find(formatedQueries);

      // Sorting
      if (sort) {
        const sortBy = sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Field Limiting
      if (fields) {
        const selectedFields = fields.split(",").join(" ");
        queryCommand = queryCommand.select(selectedFields);
      }

      // Pagination
      const skip = (page - 1) * limit;
      queryCommand = queryCommand.skip(skip).limit(limit);

      const authors = await queryCommand.exec();
      const totalCount = await Author.find(formatedQueries).countDocuments();

      return { authors, totalCount };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createAuthor(data, filePath) {
    try {
      if (filePath) {
        data.image = filePath; // URL ảnh từ Cloudinary
      }
      const author = new Author(data);
      return await author.save();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAuthor(id, data, filePath) {
    try {
      const existingAuthor = await Author.findById(id);
      if (!existingAuthor) throw new Error("Author not found");

      // Xóa ảnh cũ trên Cloudinary nếu có ảnh mới
      let newImageUrl = null;
      if (filePath && existingAuthor.image) {
        newImageUrl = filePath; // Lưu URL của ảnh mới
        body.image = newImageUrl; // Cập nhật URL ảnh mới vào body
        data.image = filePath; // Gán ảnh mới
      }

      return await Author.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteAuthor(id) {
    try {
      return await Author.delete({ _id: id });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async forceDeleteAuthor(id) {
    try {
      return await Author.deleteOne({ _id: id });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async restoreAuthor(id) {
    try {
      await Author.restore({ _id: id });
      return await Author.findById(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuthorService();
