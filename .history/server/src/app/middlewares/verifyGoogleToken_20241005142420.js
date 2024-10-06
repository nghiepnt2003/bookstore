const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const client = new OAuth2Client(
  "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"
);

const verifyGoogleToken = async (req, res, next) => {
  const idToken = req?.header("Authorization")?.split(" ")[1]; // Lấy id_token từ header
  const accessToken = req.body.accessToken || req.query.accessToken; // Lấy access_token từ body hoặc query

  if (!idToken || !accessToken) {
    return res
      .status(401)
      .json({ status: false, error: "Unauthorized: No token provided" });
  }

  try {
    // Xác thực idToken với Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: client._clientId, // Client ID của bạn
    });

    const payload = ticket.getPayload(); // Payload chứa thông tin người dùng
    req.user = {
      _id: payload.sub, // Google ID của user
      email: payload.email,
    };

    // Xác thực access_token
    await client.getTokenInfo(accessToken); // Chỉ để xác thực access_token

    // Gọi Google User Info API để lấy tên và ảnh
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Lưu thông tin vào req.user
    req.user.name = userInfoResponse.data.name; // Lấy tên
    req.user.image = userInfoResponse.data.picture; // Lấy ảnh

    // Gọi next() để tiếp tục xử lý
    next();
  } catch (error) {
    console.error("Error verifying token", error);
    res
      .status(401)
      .json({ status: false, error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyGoogleToken;

return res.json(req.user);
