// const socketIo = require("socket.io");
// const Message = require("../app/models/Message"); // Giả sử bạn đã có Message model

// module.exports = (server, app) => {
//   // Khởi tạo Socket.io với server
//   const io = socketIo(server, {
//     cors: {
//       origin: "*", // Thay bằng URL của client nếu cần
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected");

//     // Lắng nghe sự kiện sendMessage từ client
//     socket.on("sendMessage", async ({ sender, receiver, content }) => {
//       try {
//         // Lưu tin nhắn vào MongoDB
//         const newMessage = new Message({
//           sender,
//           receiver,
//           content,
//           isRead: false,
//         });
//         await newMessage.save();

//         // Gửi tin nhắn cho người nhận thông qua socket
//         io.to(receiver.toString()).emit("receiveMessage", newMessage);

//         console.log("Message sent:", newMessage);
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     });

//     // Ngắt kết nối
//     socket.on("disconnect", () => {
//       console.log("User disconnected");
//     });
//   });

//   // Lưu io vào app để có thể sử dụng trong các route
//   app.set("io", io);
// };
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

    // Tham gia vào phòng của người dùng, sử dụng ID để phân biệt phòng
    socket.on("joinRoom", (userId) => {
      socket.join(userId.toString());
      console.log(`User with ID ${userId} joined their room.`);
    });

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

        // Gửi tin nhắn cho người nhận thông qua socket, vào phòng của người nhận
        io.to(receiver.toString()).emit("receiveMessage", newMessage);

        console.log("Message sent:", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Xử lý khi người dùng ngắt kết nối
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Lưu io vào app để có thể sử dụng trong các route
  app.set("io", io);
};
