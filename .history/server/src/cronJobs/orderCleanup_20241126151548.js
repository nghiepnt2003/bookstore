const cron = require("node-cron");
const { Payment } = require("../app/models/Payment");
const Order = require("../app/models/Order");

// Chạy công việc này mỗi phút (có thể tùy chỉnh thời gian theo yêu cầu)
cron.schedule("* * * * *", async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // Thời gian 30 phút trước

  try {
    // Tìm các đơn hàng cần hủy
    const ordersToCancel = await Order.find({
      status: "Not Yet Paid",
      createdAt: { $lt: thirtyMinutesAgo }, // Đơn hàng được tạo hơn 30 phút trước
    });

    // Cập nhật trạng thái của từng đơn hàng tìm thấy
    for (const order of ordersToCancel) {
      order.status = "Cancelled";
      await order.save();
    }

    if (ordersToCancel.length > 0) {
      console.log(`Cancelled ${ordersToCancel.length} orders due to timeout.`);
    }
  } catch (error) {
    console.error("Failed to update order statuses:", error.message);
  }
});
