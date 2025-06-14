import axios from "axios";

export const apiLoginWithGoogle = async ({ idToken, accessToken }) => {
  console.log("ID: " + idToken);
  console.log("Access Token: " + accessToken);

  const URL_SERVER = process.env.REACT_APP_API_URI || "http://localhost:3000";
  console.log("URL_SERVER = ", URL_SERVER);

  try {
    const response = await axios.post(
      `${URL_SERVER}/user/loginWithGoogle`,
      {
        accessToken, // Gửi accessToken trong body
      },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Trả về dữ liệu từ phản hồi
  } catch (error) {
    if (error.response) {
      console.error("Error: ", error.response.data);
    } else {
      console.error("Error: ", error.message);
    }
    throw error; // Ném lỗi để xử lý bên ngoài
  }
};
