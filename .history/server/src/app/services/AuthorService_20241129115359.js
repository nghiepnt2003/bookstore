const Author = require("../models/Author");
const Cloud = require("../../config/cloud/cloudinary.config");
const cloudinary = require("cloudinary").v2;
const { checkDocumentById } = require("../middlewares/checkDocumentMiddleware");

class AuthorService {
  async getById(id) {
    try {
      return await Author.findOne({ _id: id });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAll(queryParams) {
    try {
      const excludeFields = ["limit", "sort", "page", "fields"];
      const queries = { ...queryParams };
      excludeFields.forEach((el) => delete queries[el]);

      let queryString = JSON.stringify(queries);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      let queryCommand = Author.find(formatedQueries);

      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      if (queryParams.fields) {
        const fields = queryParams.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      const page = +queryParams.page || 1;
      const limit = +queryParams.limit || process.env.LIMIT_AUTHORS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      const response = await queryCommand.exec();
      const counts = await Author.find(formatedQueries).countDocuments();

      return { success: response.length > 0, counts, authors: response };
    } catch (error) {
      throw new Error(error);
    }
  }

  async store(authorData, file) {
    try {
      if (file && file.path) {
        authorData.image = file.path; // URL ảnh trên Cloudinary
      }

      const author = new Author(authorData);
      return await author.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id, authorData, file) {
    try {
      const existingAuthor = await Author.findById(id);
      if (!existingAuthor) {
        throw new Error("Author not found");
      }

      if (file) {
        if (existingAuthor.image) {
          const publicId = existingAuthor.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`bookstore/${publicId}`);
        }

        authorData.image = file.path;
      }

      return await Author.findByIdAndUpdate(id, authorData, { new: true });
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(id) {
    try {
      const check = await checkDocumentById(Author, id);
      if (!check.exists) {
        throw new Error(check.message);
      }
      await Author.delete({ _id: id });
    } catch (error) {
      throw new Error(error);
    }
  }

  async forceDelete(id) {
    try {
      await Author.deleteOne({ _id: id });
    } catch (error) {
      throw new Error(error);
    }
  }

  async restore(id) {
    try {
      const restoredAuthor = await Author.restore({ _id: id });
      if (!restoredAuthor) {
        throw new Error("Author not found");
      }
      return restoredAuthor;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = new AuthorService();
