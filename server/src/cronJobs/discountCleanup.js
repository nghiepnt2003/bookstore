const cron = require("node-cron");
const Product = require("../app/models/Product");
const Discount = require("../app/models/Discount");

// Tạo cron job chạy vào lúc 00:01 mỗi ngày
cron.schedule("1 0 * * *", async () => {
  console.log(
    "Running a scheduled task to check expired discounts at 00:01..."
  );

  try {
    const currentDate = new Date();

    // Tìm tất cả các giảm giá đã hết hạn
    const expiredDiscounts = await Discount.find({
      endDate: { $lt: currentDate },
    });

    if (expiredDiscounts.length === 0) {
      console.log("No expired discounts found.");
      return;
    }

    // Tạo danh sách các ID của giảm giá đã hết hạn
    const expiredDiscountIds = expiredDiscounts.map((discount) => discount._id);

    // Tìm tất cả các sản phẩm có giảm giá thuộc các giảm giá đã hết hạn
    const productsToUpdate = await Product.find({
      discount: { $in: expiredDiscountIds },
    });

    if (productsToUpdate.length === 0) {
      console.log("No products with expired discounts found.");
      return;
    }

    // Cập nhật để xóa giảm giá khỏi các sản phẩm này
    const updatedProducts = await Product.updateMany(
      { discount: { $in: expiredDiscountIds } },
      { $unset: { discount: "" } } // Loại bỏ trường discount
    );

    console.log(` products updated, discount removed.`);
  } catch (error) {
    console.error("Error during expired discount cleanup:", error);
  }
});
