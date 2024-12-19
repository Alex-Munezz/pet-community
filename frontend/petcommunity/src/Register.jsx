import React, { useState } from 'react';
import { register } from './auth';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await register(userData);
    if (response.status === 'success') {
      setMessage('Account created successfully! Please log in.');
    } else {
      setMessage(response.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={userData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
        <h3>Have an account? <a href='/' >Login</a></h3>
      </form>
    </div>
  );
};

export default Register;
