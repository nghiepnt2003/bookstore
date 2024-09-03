const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var path = require("path");

const app = express();
const port = 3000;

//http logger
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});