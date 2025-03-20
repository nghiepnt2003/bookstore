const Discount = require("../models/Discount");
const Product = require("../models/Product");

class DiscountService {
  // Lấy chi tiết một chương trình giảm giá theo ID
  async getDiscountById(discountId) {
    const discount = await Discount.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }
    return discount;
  }

  // Lấy tất cả các chương trình giảm giá
  async getAllDiscounts(queries) {
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
      const formattedQueries = JSON.parse(queryString);

      // Filtering (Tìm kiếm theo name nếu có)
      if (queries?.name) {
        formattedQueries.name = { $regex: queries.name, $options: "i" };
      }

      // Thêm bộ lọc cho startDate và endDate
      if (queries.startDate) {
        formattedQueries.startDate = { $gte: new Date(queries.startDate) }; // Tìm kiếm các chương trình bắt đầu từ ngày này trở đi
      }
      if (queries.endDate) {
        formattedQueries.endDate = { $lte: new Date(queries.endDate) }; // Tìm kiếm các chương trình kết thúc trước ngày này
      }

      // Khởi tạo query
      let queryCommand = Discount.find(formattedQueries);

      // Sorting
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }

      // Fields limiting
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }

      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || process.env.LIMIT_DISCOUNTS || 100;
      const skip = (page - 1) * limit;
      queryCommand = queryCommand.skip(skip).limit(limit);

      const response = await queryCommand.exec();
      const counts = await Discount.countDocuments(formattedQueries);

      return { response, counts };
    } catch (error) {
      throw error;
    }
  }

  // Tạo mới một chương trình giảm giá
  // async createDiscount(discountData) {
  //   const { name, discountPercentage, startDate, endDate } = discountData;

  //   if ((!name, !discountPercentage || !startDate || !endDate)) {
  //     throw new Error("Missing required fields");
  //   }

  //   const newDiscount = new Discount({
  //     name,
  //     discountPercentage,
  //     startDate,
  //     endDate,
  //   });

  //   return await newDiscount.save();
  // }
  async createDiscount(discountData) {
    let { name, discountPercentage, startDate, endDate } = discountData;

    if (!name || !discountPercentage || !startDate || !endDate) {
      throw new Error("Missing required fields");
    }

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    startDate.setHours(0, 0, 0, 0); // Đầu ngày
    endDate.setHours(23, 59, 59, 999); // Cuối ngày
    if (startDate > endDate) {
      throw new Error("Start date cannot be later than end date");
    }
    const newDiscount = new Discount({
      name,
      discountPercentage,
      startDate,
      endDate,
    });

    return await newDiscount.save();
  }

  // Cập nhật chương trình giảm giá
  // async updateDiscount(discountId, updateData) {
  //   const updatedDiscount = await Discount.findByIdAndUpdate(
  //     discountId,
  //     updateData,
  //     { new: true }
  //   );

  //   if (!updatedDiscount) {
  //     throw new Error("Discount not found");
  //   }

  //   return updatedDiscount;
  // }
  async updateDiscount(discountId, updateData) {
    let { name, discountPercentage, startDate, endDate } = updateData;

    if (startDate) startDate = new Date(startDate);
    if (endDate) endDate = new Date(endDate);

    startDate.setHours(0, 0, 0, 0); // Đầu ngày
    endDate.setHours(23, 59, 59, 999); // Cuối ngày
    if (startDate > endDate) {
      throw new Error("Start date cannot be later than end date");
    }

    const updatedDiscount = await Discount.findByIdAndUpdate(
      discountId,
      { name, discountPercentage, startDate, endDate },
      { new: true }
    );

    if (!updatedDiscount) {
      throw new Error("Discount not found");
    }

    return updatedDiscount;
  }

  // Xóa chương trình giảm giá
  async deleteDiscount(discountId) {
    const deletedDiscount = await Discount.findByIdAndDelete(discountId);

    if (!deletedDiscount) {
      throw new Error("Discount not found");
    }

    return deletedDiscount;
  }

  // Áp dụng giảm giá cho tất cả sản phẩm
  async applyDiscountToAllProducts(discountId) {
    const discount = await Discount.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }

    const currentDate = new Date();
    if (currentDate > discount.endDate || currentDate < discount.startDate) {
      throw new Error("Discount is not valid or expired");
    }

    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    if (products.length === 0) {
      throw new Error("No products found");
    }

    // Áp dụng giảm giá cho tất cả sản phẩm
    const updatedProducts = [];
    for (let product of products) {
      product.discount = discount._id; // Gán discount cho sản phẩm
      await product.save(); // Lưu sản phẩm
      updatedProducts.push(product);
    }

    return updatedProducts;
  }

  // Áp dụng giảm giá cho một sản phẩm
  async applyDiscountToProduct(productId, discountId) {
    // Kiểm tra xem discount có tồn tại hay không
    const discount = await Discount.findById(discountId);
    if (!discount) {
      throw new Error("Discount not found");
    }

    // Kiểm tra nếu giảm giá đã hết hạn hoặc chưa bắt đầu
    const currentDate = new Date();
    if (currentDate < discount.startDate || currentDate > discount.endDate) {
      throw new Error("Discount is not valid or expired");
    }

    // Tìm sản phẩm và cập nhật discount
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.discount = discount._id;
    const updatedProduct = await product.save();

    return updatedProduct;
  }
}

module.exports = new DiscountService();
