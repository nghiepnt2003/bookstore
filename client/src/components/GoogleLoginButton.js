import React from "react";
import { useNavigate } from "react-router-dom";
import gg_logo from '../assets/gg_logo.jpg'

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const clientId = "181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com"; // Thay thế bằng Client ID của bạn
  const redirectUri = "http://localhost:3001/callback"; // URL callback của bạn
  const scope = "profile email";
  const responseType = "token id_token";

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center px-4 py-2 bg-[#f8f8f8] text-white rounded-md hover:bg-[#e2e1e1] transition duration-200"
    >
      <img 
        src={gg_logo}
        alt="Google Logo" 
        className="h-5 mr-2" 
      />
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;