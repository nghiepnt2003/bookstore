const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"
);

const verifyGoogleToken = async (req, res, next) => {
  const idToken = req?.header("Authorization")?.split(" ")[1]; // Lấy id_token từ header
  const accessToken = req.body.accessToken || req.query.accessToken;

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
      //   name: payload.name,
      //   image: payload.picture,
    };

    // Gọi Google User Info API để lấy thông tin bổ sung
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();
    req.user.name = userInfo.name; // Thêm tên vào đối tượng người dùng
    req.user.image = userInfo.picture; // Thêm hình ảnh vào đối tượng người dùng

    next(); // Gọi next() để tiếp tục xử lý
  } catch (error) {
    console.error("Error verifying token", error);
    res
      .status(401)
      .json({ status: false, error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyGoogleToken;
