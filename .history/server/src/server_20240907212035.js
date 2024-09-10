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

const app = express();
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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

// Route init
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
