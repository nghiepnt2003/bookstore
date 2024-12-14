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

    console.log("ID TOKEN "+idToken);
    console.log("ACCESS "+accessToken);

    if (idToken) {
      console.log("AA " + idToken  )
      console.log("BB " + accessToken  )
        // Gửi idToken đến API của bạn
        apiLoginWithGoogle({ idToken, accessToken }) // Sử dụng hàm API đã định nghĩa
        .then(response => {
          console.log(response)
          if (response.success) {
            localStorage.setItem("idToken", idToken);
            localStorage.setItem("accessToken", accessToken);
            dispatch(register({ isLoggedIn: true, token: response.accessToken, userData: response.userData }));
            // navigate("/home");
          } else {
            alert(response.data.message);
            // navigate("/login");
          }
        })
        .catch(error => {
          console.error("Error during login with Google: ", error);
          alert("Đăng nhập không thành công");
          // navigate("/login");
        });

      // navigate("/home");
    } else {
      alert("Failed to login");
      navigate("/");
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>Processing login...</h1>
    </div>
  );
};

export default CallbackComponent;
