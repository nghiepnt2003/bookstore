const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"
);

const verifyGoogleToken = async (req, res, next) => {
  const idToken = req?.header("Authorization")?.split(" ")[1];
  const accessToken = req.body.accessToken || req.query.accessToken; // Lấy access_token từ body hoặc query

  // Lấy token từ header

  if (!idToken || !accessToken) {
    return res
      .status(401)
      .json({ status: false, error: "Unauthorized: No token provided" });
  }

  try {
    // Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com", // Thay thế bằng Client ID của bạn
    });

    const payload = ticket.getPayload(); // Payload chứa thông tin người dùng
    req.user = {
      _id: payload.sub, // Google ID của user
      email: payload.email,
      name: payload.name,
      image: payload.picture,
    };

    // next(); // Tiếp tục route tiếp theo
    return res.json(req.user);
  } catch (error) {
    console.error("Error verifying token", error);
    res
      .status(401)
      .json({ status: false, error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyGoogleToken;