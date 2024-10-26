const socketIo = require("socket.io");
const Message = require("../app/models/Message"); // Giả sử bạn đã có Message model

module.exports = (server) => {
  // Khởi tạo Socket.io với server
  const io = socketIo(server, {
    cors: {
      origin: "*", // Thay bằng URL của client nếu cần
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Lắng nghe sự kiện sendMessage từ client
    socket.on("sendMessage", async ({ sender, receiver, content }) => {
      try {
        // Lưu tin nhắn vào MongoDB
        const newMessage = new Message({
          sender,
          receiver,
          content,
          isRead: false,
        });
        await newMessage.save();

        // Gửi tin nhắn cho người nhận thông qua socket
        io.to(receiver).emit("receiveMessage", newMessage);

        console.log("Message sent:", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Lưu io vào app để có thể sử dụng trong các route
  app.set("io", io);
};
