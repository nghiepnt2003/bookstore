import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiLoginWithGoogle } from "../apis";
import { useDispatch } from "react-redux";
import { register } from "../store/user/userSlice";

const CallbackComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");

    if (idToken && accessToken) {
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("accessToken", accessToken);

      // Gửi idToken đến API của bạn
      apiLoginWithGoogle({ idToken, accessToken })
        .then(response => {
          console.log(response);
          if (response.success) {
            dispatch(register({ isLoggedIn: true, token: response.accessToken, userData: response.userData }));
            navigate("/home");
          } else {
            alert(response.data.message);
            navigate("/login");
          }
        })
        .catch(error => {
          console.error("Error during login with Google: ", error);
          alert("Đăng nhập không thành công");
          navigate("/login");
        });
    } else {
      alert("Failed to login");
      navigate("/");
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-[#f893cb] rounded flex flex-col items-center py-8 z-50 h-screen justify-center">
      <h1 className="text-2xl text-white">Processing login...</h1>
    </div>
  );
};

export default CallbackComponent;