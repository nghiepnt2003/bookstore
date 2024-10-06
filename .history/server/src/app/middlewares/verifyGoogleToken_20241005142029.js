// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client(
//   "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"
// );

// const verifyGoogleToken = async (req, res, next) => {
//   const idToken = req?.header("Authorization")?.split(" ")[1]; // Lấy id_token từ header
//   const accessToken = req.body.accessToken || req.query.accessToken; // Lấy access_token từ body hoặc query

//   if (!idToken || !accessToken) {
//     return res
//       .status(401)
//       .json({ status: false, error: "Unauthorized: No token provided" });
//   }

//   try {
//     // Xác thực idToken với Google
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: client._clientId, // Client ID của bạn
//     });

//     const payload = ticket.getPayload(); // Payload chứa thông tin người dùng
//     req.user = {
//       _id: payload.sub, // Google ID của user
//       email: payload.email,
//       name: payload.name,
//       image: payload.picture,
//     };

//     // Xác thực access_token
//     const response = await client.getTokenInfo(accessToken);
//     req.user.accessTokenData = response; // Lưu thông tin từ access_token nếu cần

//     return res.json(req.user);
//     // Tiếp tục route tiếp theo
//     // next();
//   } catch (error) {
//     console.error("Error verifying token", error);
//     res
//       .status(401)
//       .json({ status: false, error: "Unauthorized: Invalid token" });
//   }
// };

// module.exports = verifyGoogleToken;

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"
);

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: CLIENT_ID, // Nhập Google Client ID của bạn
  });

  const payload = ticket.getPayload();

  // Thông tin người dùng
  const userId = payload["sub"]; // ID người dùng Google
  const name = payload["name"];
  const email = payload["email"];
  const avatar = payload["picture"];

  return { name, email, avatar };
}

// Sử dụng hàm này trong server của bạn khi nhận được idToken
const idToken = "idToken nhận được từ client";
verifyIdToken(idToken)
  .then((userInfo) => {
    console.log(userInfo); // { name, email, avatar }
  })
  .catch((err) => {
    console.error("Lỗi xác thực idToken:", err);
  });
