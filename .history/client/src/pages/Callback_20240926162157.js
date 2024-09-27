import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const idToken = params.get('id_token');

    if (idToken) {
      // Chỗ này có thể call API để lưu vào database
      localStorage.setItem('idToken', idToken);
      navigate('/home');
    } else {
      alert('Failed to login');
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>Processing login...</h1>
    </div>
  );
};

export default Callback;