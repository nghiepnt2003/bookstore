import React from 'react';

const Home = () => {
  const idToken = localStorage.getItem('idToken');

  return (
    <div>
      <h1>Home Page</h1>
      {idToken ? (
        <div>
          <h2>ID Token:</h2>
          <p>{idToken}</p>
        </div>
      ) : (
        <p>No ID Token found. Please login.</p>
      )}
    </div>
  );
};

export default Home;