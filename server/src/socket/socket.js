const socketIo = require("socket.io");
const Message = require("../app/models/Message");
const cloudinary = require("cloudinary").v2;

module.exports = (server, app) => {
  // Khởi tạo Socket.io với server
  const io = socketIo(server, {
    cors: {
      origin: "*", // Thay bằng URL của client nếu cần
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Tham gia vào room dựa trên userId (để nhận thông báo nếu cần)
    // socket.on("joinUserRoom", (userId) => {
    //   socket.join(userId.toString());
    //   console.log(`User ${userId} joined their personal room.`);
    // });
    // Tham gia vào room dựa trên conversationId
    socket.on("joinConversation", ({ user1, user2 }) => {
      const roomId = `room_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
      socket.join(roomId);
      console.log(`User joined conversation: ${roomId}`);
    });

    // Lắng nghe sự kiện sendMessage từ client
    // socket.on(
    //   "sendMessage",
    //   async ({ sender, receiver, content, image }, callback) => {
    //     try {
    //       const roomId = `room_${Math.min(sender, receiver)}_${Math.max(
    //         sender,
    //         receiver
    //       )}`;

    //       let imageUrl = null;

    //       // Nếu có ảnh, upload lên Cloudinary
    //       if (image) {
    //         const result = await cloudinary.uploader.upload(image, {
    //           folder: "messages", // Lưu ảnh vào thư mục messages
    //           allowed_formats: ["jpg", "png", "jpeg"],
    //         });
    //         imageUrl = result.secure_url;
    //       }

    //       // Lưu tin nhắn vào MongoDB
    //       const newMessage = new Message({
    //         sender,
    //         receiver,
    //         content,
    //         image: imageUrl, // Thêm ảnh vào tin nhắn
    //         isRead: false,
    //       });

    //       await newMessage.save();

    //       // Gửi tin nhắn đến cả hai người trong room
    //       io.to(roomId).emit("receiveMessage", newMessage);
    //       console.log("Message sent:", newMessage);

    //       if (callback)
    //         callback({ success: true, message: "Message sent successfully" });
    //     } catch (error) {
    //       console.error("Error sending message:", error);
    //       socket.emit("error", { message: "Failed to send message" });
    //     }
    //   }
    // );

    socket.on(
      "sendMessage",
      async ({ sender, receiver, content, images }, callback) => {
        console.log("Received message data:", {
          sender,
          receiver,
          content,
          images,
        });

        try {
          const roomId = `room_${Math.min(sender, receiver)}_${Math.max(
            sender,
            receiver
          )}`;
          let imageUrls = [];

          if (images && images.length > 0) {
            // Xử lý từng hình ảnh trong mảng images
            for (const image of images) {
              // Tạo một Promise để tải lên hình ảnh
              const uploadPromise = new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    folder: "messages",
                    allowed_formats: ["jpg", "png", "jpeg"],
                  },
                  (error, result) => {
                    if (error) {
                      console.error("Error uploading image:", error);
                      reject(error); // Thực hiện reject nếu có lỗi
                    } else {
                      resolve(result.secure_url); // Lưu URL vào mảng
                    }
                  }
                );

                // Đẩy Buffer vào stream
                stream.end(image);
              });

              // Chờ cho việc tải lên hoàn tất và lấy URL
              const url = await uploadPromise;
              imageUrls.push(url);
            }
          }

          // Lưu tin nhắn vào MongoDB
          const newMessage = new Message({
            sender,
            receiver,
            content,
            images: imageUrls.length > 0 ? imageUrls : null, // Thêm hình ảnh vào tin nhắn
            isRead: false,
          });

          await newMessage.save();

          // Gửi tin nhắn đến cả hai người trong room
          io.to(roomId).emit("receiveMessage", newMessage);
          console.log("Message sent:", newMessage);

          if (callback)
            callback({ success: true, message: "Message sent successfully" });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Lắng nghe sự kiện sửa tin nhắn
    // socket.on("updateMessage", async (updatedMessageData) => {
    //   try {
    //     // Giả sử bạn có thông tin messageId, content và image trong updatedMessageData
    //     const { messageId, content, image } = updatedMessageData;

    //     const message = await Message.findById(messageId);
    //     // Kiểm tra xem tin nhắn có tồn tại và có phải của người gửi không
    //     if (!message || message.sender.toString() !== sender.toString()) {
    //       return socket.emit("error", { message: "Unauthorized update" });
    //     }

    //     // Tìm và cập nhật tin nhắn trong MongoDB
    //     const updatedMessage = await Message.findByIdAndUpdate(
    //       messageId,
    //       { content, image },
    //       { new: true }
    //     );

    //     // Gửi tin nhắn đã cập nhật cho người nhận
    //     io.to(updatedMessage.receiver.toString()).emit(
    //       "receiveMessage",
    //       updatedMessage
    //     );
    //     io.to(updatedMessage.sender.toString()).emit(
    //       "receiveMessage",
    //       updatedMessage
    //     );

    //     console.log("Message updated:", updatedMessage);
    //   } catch (error) {
    //     console.error("Error updating message:", error);
    //   }
    // });
    socket.on(
      "updateMessage",
      async ({ messageId, sender, content, image }) => {
        try {
          const message = await Message.findById(messageId);

          if (!message || message.sender.toString() !== sender.toString()) {
            return socket.emit("error", { message: "Unauthorized update" });
          }

          message.content = content;
          message.image = image || message.image;
          await message.save();

          // Gửi tin nhắn đã cập nhật đến roomId
          const roomId = `room_${Math.min(
            message.sender,
            message.receiver
          )}_${Math.max(message.sender, message.receiver)}`;
          io.to(roomId).emit("receiveMessage", message);
          console.log("Message updated:", message);
        } catch (error) {
          console.error("Error updating message:", error);
        }
      }
    );

    // Lắng nghe sự kiện deleteMessage từ client
    // socket.on("deleteMessage", async (messageId) => {
    //   try {
    //     // Thực hiện xóa tin nhắn từ MongoDB nếu cần
    //     const deletedMessage = await Message.findByIdAndDelete(messageId);
    //     if (deletedMessage) {
    //       io.to(deletedMessage.receiver.toString()).emit(
    //         "deleteMessage",
    //         deletedMessage
    //       );
    //       console.log("Message deleted:", deletedMessage);
    //     }
    //   } catch (error) {
    //     console.error("Error deleting message:", error);
    //     socket.emit("error", { message: "Failed to delete message" });
    //   }
    // });
    socket.on("deleteMessage", async ({ messageId, sender }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== sender.toString()) {
          return socket.emit("error", { message: "Unauthorized delete" });
        }

        await Message.findByIdAndDelete(messageId);

        const roomId = `room_${Math.min(
          message.sender,
          message.receiver
        )}_${Math.max(message.sender, message.receiver)}`;
        io.to(roomId).emit("deleteMessage", messageId);
        console.log("Message deleted:", messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    // socket.on("markAsRead", async ({ messageId, receiver }) => {
    //   try {
    //     const message = await Message.findById(messageId);

    //     // Chỉ cập nhật nếu đúng người nhận
    //     if (!message || message.receiver.toString() !== receiver.toString()) {
    //       return socket.emit("error", { message: "Unauthorized action" });
    //     }

    //     message.isRead = true;
    //     await message.save();

    //     io.to(message.sender.toString()).emit("messageRead", message);
    //     io.to(message.receiver.toString()).emit("messageRead", message);

    //     console.log("Message marked as read:", message);
    //   } catch (error) {
    //     console.error("Error marking message as read:", error);
    //   }
    // });

    // Xử lý khi người dùng ngắt kết nối

    // Đánh dấu tin nhắn là đã đọc
    socket.on("markAsRead", async ({ messageId, receiver }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.receiver.toString() !== receiver.toString()) {
          return socket.emit("error", { message: "Unauthorized action" });
        }

        message.isRead = true;
        await message.save();

        const roomId = `room_${Math.min(
          message.sender,
          message.receiver
        )}_${Math.max(message.sender, message.receiver)}`;
        io.to(roomId).emit("messageRead", message);
        console.log("Message marked as read:", message);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Lưu io vào app để có thể sử dụng trong các route
  app.set("io", io);
};
