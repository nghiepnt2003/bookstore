// import React from "react";

// const GoogleLoginButton = () => {
//   const clientId =
//     "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com";
//   const redirectUri = "http://localhost:3001";
//   const scope = "profile email";
//   const responseType = "token id_token";

//   const handleLogin = () => {
//     const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
//     window.location.href = authUrl;
//   };

//   return <button onClick={handleLogin}>Login with Google</button>;
// };

// export default GoogleLoginButton;


import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { apiLoginWithGoogle } from "../apis"; // Đảm bảo bạn đã tạo API này
import CallbackComponent from "./CallbackComponent";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const clientId = "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"; // Thay thế bằng Client ID của bạn
  const redirectUri = "http://localhost:3001/callback"; // URL callback của bạn
  const scope = "profile email";
  const responseType = "token id_token";

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
    window.location.href = authUrl;
    <CallbackComponent />
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const idToken = params.get("id_token");

      if (idToken) {
        const decodedToken = jwtDecode(idToken);
        loginWithGoogle(decodedToken);
      }
    }
  }, []);

  const loginWithGoogle = async (userInfo) => {
    try {
      console.log("USERIFO " + userInfo)
      const response = await apiLoginWithGoogle(userInfo);
      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/home");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error logging in with Google: ", error);
      alert("Đăng nhập không thành công");
    }
  };

  return <button onClick={handleLogin}>Login with Google</button>;
};

export default GoogleLoginButton;