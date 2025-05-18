// const cron = require("node-cron");
// const { Payment } = require("../app/models/Payment");
// const Order = require("../app/models/Order");

// // Chạy công việc này mỗi phút (có thể tùy chỉnh thời gian theo yêu cầu)
// cron.schedule("* * * * *", async () => {
//   const thirtyMinutesAgo = new Date(Date.now() - 100 * 60 * 1000); // Thời gian 1h40p = 100 phút trước

//   try {
//     // Tìm các đơn hàng cần hủy
//     const ordersToCancel = await Order.find({
//       status: "Not Yet Paid",
//       createdAt: { $lt: thirtyMinutesAgo }, // Đơn hàng được tạo hơn 30 phút trước
//     });

//     // Cập nhật trạng thái của từng đơn hàng tìm thấy
//     for (const order of ordersToCancel) {
//       order.status = "Cancelled";
//       await order.save();
//     }

//     if (ordersToCancel.length > 0) {
//       console.log(`Cancelled ${ordersToCancel.length} orders due to timeout.`);
//     }
//   } catch (error) {
//     console.error("Failed to update order statuses:", error.message);
//   }
// });

const cron = require("node-cron");
const { Payment } = require("../app/models/Payment");
const Order = require("../app/models/Order");

// Chạy công việc mỗi phút (hoặc thay đổi lại theo lịch bạn mong muốn, ví dụ: "0 * * * *" để chạy mỗi giờ)
cron.schedule("* * * * *", async () => {
  const now = new Date();

  // 1. Đơn chưa thanh toán sau 100 phút thì huỷ
  const oneHourFortyAgo = new Date(now.getTime() - 100 * 60 * 1000);

  // 2. Đơn đang giao (Transported) quá 7 ngày thì chuyển thành Successed
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // ======== HUỶ ĐƠN CHƯA THANH TOÁN ========
    const unpaidOrders = await Order.find({
      status: "Not Yet Paid",
      createdAt: { $lt: oneHourFortyAgo },
    });

    for (const order of unpaidOrders) {
      order.status = "Cancelled";
      await order.save();
    }

    if (unpaidOrders.length > 0) {
      console.log(
        `✅ Cancelled ${unpaidOrders.length} unpaid orders after 100 mins.`
      );
    }

    // ======== CẬP NHẬT ĐƠN GIAO HÀNG THÀNH "Successed" ========
    const deliveredOrders = await Order.find({
      status: "Transported",
      updatedAt: { $lte: sevenDaysAgo },
    });

    for (const order of deliveredOrders) {
      order.status = "Successed";
      await order.save();
    }

    if (deliveredOrders.length > 0) {
      console.log(
        `✅ Updated ${deliveredOrders.length} orders to 'Successed' after 7 days.`
      );
    }
  } catch (error) {
    console.error("❌ Error in cron job:", error.message);
  }
});
