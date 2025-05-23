const socketIo = require("socket.io");
const Message = require("../app/models/Message");

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
    // socket.on("sendMessage", async ({ sender, receiver, content }) => {
    //   try {
    //     // Lưu tin nhắn vào MongoDB
    //     const newMessage = new Message({
    //       sender,
    //       receiver,
    //       content,
    //       isRead: false,
    //     });
    //     await newMessage.save();

    //     // Gửi tin nhắn cho người nhận thông qua socket, vào phòng của người gửi và người nhận
    //     io.to(sender.toString()).emit("receiveMessage", newMessage);
    //     io.to(receiver.toString()).emit("receiveMessage", newMessage);

    //     console.log("Message sent:", newMessage);
    //   } catch (error) {
    //     console.error("Error sending message:", error);
    //     socket.emit("error", { message: "Failed to send message" });
    //   }
    // });

    socket.on("sendMessage", async ({ sender, receiver, content }) => {
      try {
        const roomId = `room_${Math.min(sender, receiver)}_${Math.max(
          sender,
          receiver
        )}`;

        // Lưu tin nhắn vào MongoDB
        const newMessage = new Message({
          sender,
          receiver,
          content,
          isRead: false,
        });
        await newMessage.save();

        // Gửi tin nhắn đến cả hai người trong room
        io.to(roomId).emit("receiveMessage", newMessage);
        console.log("Message sent:", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

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
