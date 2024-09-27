const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");

class OrderController {
  //[GET] /order/:id
  //   async getById(req, res) {
  //     try {
  //       let order = await Order.findOne({ _id: req.params.id });
  //       res.status(200).json({ success: order ? true : false, order });
  //     } catch (error) {
  //       res.status(500).json({ success: false, message: error });
  //     }
  //   }

  //[GET] /order/
  //   async getAll(req, res) {
  //     try {
  //         const queries = { ...req.query };
  //         // Tách các trường đặc biệt ra khỏi query
  //         const excludeFields = ["limit", "sort", "page", "fields"];
  //         excludeFields.forEach((el) => delete queries[el]);

  //         // Format lại các operators cho đúng cú pháp mongoose
  //         let queryString = JSON.stringify(queries);
  //         queryString = queryString.replace(
  //           /\b(gte|gt|lt|lte)\b/g,
  //           (matchedEl) => `$${matchedEl}`
  //         );
  //         const formatedQueries = JSON.parse(queryString);

  //         // Filtering
  //         if (queries?.name) {
  //           formatedQueries.name = { $regex: queries.name, $options: "i" };
  //         }

  //         // Execute query
  //         let queryCommand = Author.find(formatedQueries);

  //         // Sorting
  //         if (req.query.sort) {
  //           // abc,exg => [abc,exg] => "abc exg"
  //           const sortBy = req.query.sort.split(",").join(" ");
  //           // sort lần lượt bởi publisher author category nếu truyền  sort("publisher author categories")
  //           queryCommand = queryCommand.sort(sortBy);
  //         }

  //         // fields limiting
  //         if (req.query.fields) {
  //           const fields = req.query.fields.split(",").join(" ");
  //           queryCommand = queryCommand.select(fields);
  //         }

  //         //Pagination
  //         // limit: số docs lấy về 1 lần gọi API
  //         // skip:
  //         // Dấu + nằm trước số để chuyển sang số
  //         // +'2' => 2
  //         // +'asdasd' => NaN
  //         const page = +req.query.page || 1;
  //         const limit = +req.query.limit || process.env.LIMIT_AUTHORS;
  //         const skip = (page - 1) * limit;
  //         queryCommand.skip(skip).limit(limit);

  //         // Lấy danh sách sản phẩm
  //         const response = await queryCommand.exec();

  //         // Lấy số lượng sản phẩm
  //         const counts = await Author.find(formatedQueries).countDocuments();

  //         res.status(200).json({
  //           success: response.length > 0,
  //           counts,
  //           authors: response.length > 0 ? response : "Cannot get authors",
  //         });
  //       } catch (error) {
  //         res.status(500).json({ success: false, message: error.message });
  //       }

  //   }

  //[POST] /order/checkout
  async checkout(req, res) {
    try {
      const user = req.user; // Lấy thông tin user từ accessToken

      let cart = await Cart.findOne({ user: user._id }).populate({
        path: "items",
        select: "selectedForCheckout quantity",
        populate: {
          path: "product",
          select: "_id name price image",
        },
      });

      if (!cart) {
        return res
          .status(400)
          .json({ success: false, message: "Cart not found" });
      }

      const selectedItems = cart.items.filter(
        (item) => item.selectedForCheckout && !item.deleted
      );
      if (selectedItems.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No items selected for checkout" });
      }
      // Mảng lưu trữ các _id của OrderDetail đã lưu
      const orderDetailsIds = [];
      console.log("Selected Items  filtering:", selectedItems);
      // Vòng lặp for để tạo OrderDetail cho mỗi item
      for (const item of selectedItems) {
        console.log("item ", item);
        // Tạo OrderDetail
        const orderDetail = new OrderDetail({
          productId: item.product._id,
          productName: item.product.name,
          productImage: item.product.image,
          productPrice: item.product.price,
          quantity: item.quantity,
        });

        // Lưu OrderDetail vào cơ sở dữ liệu
        const savedOrderDetail = await orderDetail.save();
        orderDetailsIds.push(savedOrderDetail._id);

        await (<Product></Product>).findByIdAndUpdate(
          item.product._id,
          { $inc: { soldCount: item.quantity } }, // Cộng thêm số lượng đã bán vào soldCount
          { new: true } // Trả về tài liệu đã được cập nhật
        );
      }

      const totalPrice = selectedItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      );
      const payment = req.body.payment;
      if (!payment) {
        return res
          .status(400)
          .json({ success: false, message: "Payment method not provided" });
      }

      const newOrder = await Order.create({
        details: orderDetailsIds,
        date: new Date(),
        status: "Pending",
        totalPrice: totalPrice,
        payment: payment, // Payment information từ client
        user: user._id,
      });

      // Nếu cần, bạn có thể xóa các item đã checkout khỏi giỏ hàng
      const itemsToRemove = cart.items.filter(
        (item) => item.selectedForCheckout
      );
      cart.items = cart.items.filter((item) => !item.selectedForCheckout);
      await cart.save();
      // Xóa các LineItem tương ứng khỏi cơ sở dữ liệu
      for (const item of itemsToRemove) {
        await LineItem.findByIdAndDelete(item._id);
      }

      res.status(200).json({
        success: true,
        message: "Checkout successful",
        order: newOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Checkout failed",
        error: error.message,
      });
    }
  }
}
module.exports = new OrderController();
