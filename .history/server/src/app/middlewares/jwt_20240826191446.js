var jwt = require("jsonwebtoken");
var fs = require("fs");

// Encode
// file privateKey được tạo từ OpenSSL
var privateKey = fs.readFileSync("../../../../key/private.pem");
const generateAccessToken = (uid, role) => jwt.sign({ _id: uid });
