import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './auth';
import './App.css';

const Login = ({ setUser }) => {  // Ensure setUser is passed as a prop
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login(credentials);

    console.log('Login Response:', response); // Debugging

    if (response.status === 'success') {
      if (!response.user || !response.user.id) {
        console.error('User ID not found in the response:', response);
        setError('Unexpected response from the server.');
        return;
      }

      const userId = response.user.id;
      setUser(userId); // Store the user ID in the parent component state

      // Save user ID to localStorage
      localStorage.setItem('user_id', userId);

      navigate('/dashboard'); // Redirect to the dashboard
    } else {
      setError(response.message || 'Invalid login credentials');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <h3>
          Don't have an account? <a href="/register">Create one</a>
        </h3>
      </form>
    </div>
  );
};

export default Login;
