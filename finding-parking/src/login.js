import React, { useState } from 'react';
import './styles.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    if (!username.trim() || !password) {
      alert("Username and password cannot be empty.");
      return;
    }

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("Failed to log in. Please try again later.");
    });
  };

  return (
    <div className="container">
      <h1>Finding Parking Spot</h1>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input type="text" id="id" required placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="pw" required placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className="form-group">
        <button className="btn btn-primary" onClick={login}>Login</button>
      </div>
      <footer>
        <a href="https://github.com/hanseulLee1127/startup">My github</a>
      </footer>
    </div>
  );
}

export default Login;
