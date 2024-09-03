var jwt = require("jsonwebtoken");
var fs = require("fs");

// Encode
// file privateKey được tạo từ OpenSSL
var privateKey = fs.readFileSync("../key/private.pem");
const generateAccessToken = (uid, role) =>
  jwt.sign({ _id: uid, role }, privateKey, {
    expiresIn: "3d",
    algorithm: "RS256",
  });

const generateRefreshToken = (uid, role) =>
  jwt.sign({ _id: uid }, privateKey, {
    expiresIn: "7d",
    algorithm: "RS256",
  });

const verifyAccessToken = async function (req, res, next) {
  try {
    // Bear Token
    // headers: {authorization: Bearer token}
    if (req?.headers?.authorization?.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
    }
  } catch (error) {}
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
