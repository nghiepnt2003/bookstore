const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const methodOverride = require("method-override");
const db = require("./config/db");
const route = require("./routes");
require("dotenv").config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("dotenv").config();
require("./cronJobs/discountCleanup");
require("./cronJobs/orderCleanup");
const xss = require("xss-clean");
const socketHandler = require("./socket/socket");
const cors = require("cors");
const app = express();
// app.use(cors({
//   origin:
// }))
const port = process.env.PORT || 3000;
//connect to db
db.connect();

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // store: new RedisStore({
    //   host: "localhost",
    //   port: 6379,
    //   client: redisClient,
    //   ttl: 86400,
    // }),
    //60s
    cookie: { secure: false, maxAge: 60000 },
  })
);

app.use(xss());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Để xử lý form-data
// parse application/json
app.use(bodyParser.json());
//http logger
app.use(morgan("combined"));
// folder tên Public được dùng các file static
// các file trong static được dùng trong project
app.use(express.static(path.join(__dirname, "/public")));

// method overide
app.use(methodOverride("_method"));
// CORS
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
//   );
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//   next();
// });

// ----------------------
// app.use((req, res, next) => {
//   const allowedOrigins = ["http://localhost:3001"]; // Chỉ định nguồn được phép
//   const origin = req.headers.origin;

//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }

//   res.header("Access-Control-Allow-Credentials", "true"); // Cho phép thông tin xác thực
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
//   );
//   res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

//   // Xử lý OPTIONS request
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

const corsOptions = {
  origin: ["http://localhost:3001"], // Chỉ định nguồn được phép (có thể thay đổi theo domain bạn cần)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Phương thức HTTP cho phép
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ], // Các header cho phép
  credentials: true, // Cho phép gửi cookies và thông tin xác thực
};

// Sử dụng cors với cấu hình đã định
app.use(cors(corsOptions));

// Middleware xử lý OPTIONS request
app.options("*", cors(corsOptions)); // Dùng OPTIONS cho mọi route

// -----------------------

// Route init
route(app);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// Khởi tạo server bằng app.listen() và gán server vào socketHandler
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Tích hợp Socket.io với server đã được khởi tạo
socketHandler(server, app); // Truyền app vào socketHandler