import React from 'react';

const GoogleLoginButton = () => {
  const clientId = '181816093508-2m603lnb2qie0oj3gvc6q4u9lujqlgb3.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:3001/callback';
  const scope = 'profile email';
  const responseType = 'token id_token';

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleLogin}>
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;