// import React from 'react';

// const GoogleLoginButton = () => {
//   const clientId = '181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com';
//   const redirectUri = 'http://localhost:3001/callback';
//   const scope = 'profile email';
//   const responseType = 'token id_token';

//   const handleLogin = () => {
//     const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
//     window.location.href = authUrl;
//   };

//   return (
//     <button onClick={handleLogin}>
//       Login with Google
//     </button>
//   );
// };

// export default GoogleLoginButton;

import React from 'react';
import { GoogleLogin } from 'react-google-login';

const GoogleLoginButton = () => {
  const clientId = '181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com'; // Thay bằng Client ID của bạn

  const onSuccess = (response) => {
    console.log('Login Success:', response);
    // Xử lý thông tin người dùng ở đây
  };

  const onFailure = (response) => {
    console.error('Login Failed:', response);
    // Xử lý lỗi ở đây
    console.error('Login Failed:', response);
    // Xử lý lỗi ở đây
    if (response.error === 'popup_closed_by_user') {
      alert('Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại.');
    } else {
      alert('Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login with Google"
      onSuccess={onSuccess}
      onFailure={onFailure}
      cookiePolicy={'single_host_origin'}
    />
  );
};

export default GoogleLoginButton;