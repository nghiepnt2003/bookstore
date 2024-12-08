const Publisher = require("../models/Publisher");

class PublisherService {
  // Lấy publisher theo id
  async getById(id) {
    try {
      return await Publisher.findOne({ _id: id });
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả publishers với các query
  async getAll(queries) {
    try {
      // Tách các trường đặc biệt ra khỏi query
      const queryCopy = { ...queries };
      const excludeFields = ["limit", "sort", "page", "fields"];
      excludeFields.forEach((el) => delete queryCopy[el]);

      // Format lại các operators cho đúng cú pháp mongoose
      let queryString = JSON.stringify(queryCopy);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
      );
      const formatedQueries = JSON.parse(queryString);

      // Filtering
      if (queries?.name) {
        formatedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Khởi tạo query
      let queryCommand = Publisher.find(formatedQueries);

      // Sorting
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // fields limiting
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_PUBLISHERS;
      const skip = (page - 1) * limit;
      queryCommand.skip(skip).limit(limit);

      const response = await queryCommand.exec();
      const counts = await Publisher.find(formatedQueries).countDocuments();

      return { response, counts };
    } catch (error) {
      throw error;
    }
  }

  // Tạo mới publisher
  async store(publisherData) {
    try {
      const publisher = new Publisher(publisherData);
      return await publisher.save();
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật publisher
  async update(id, publisherData) {
    try {
      return await Publisher.findByIdAndUpdate(id, publisherData, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // Xóa publisher
  async delete(id) {
    try {
      return await Publisher.delete({ _id: id });
    } catch (error) {
      throw error;
    }
  }

  // Force delete publisher
  async forceDelete(id) {
    try {
      return await Publisher.deleteOne({ _id: id });
    } catch (error) {
      throw error;
    }
  }

  // Restore publisher
  async restore(id) {
    try {
      return await Publisher.restore({ _id: id });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PublisherService();
