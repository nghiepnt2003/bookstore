var jwt = require("jsonwebtoken");
var fs = require("fs");

// Encode

var privateKey = fs.readFileSync("./key/private.pem");
