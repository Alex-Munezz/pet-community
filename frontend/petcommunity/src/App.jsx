import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirect
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);

  // Check if a user ID is stored in localStorage on app load
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUser(storedUserId);
    }
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* Home route ("/") will redirect to /dashboard if user is logged in */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
            
            {/* Register route */}
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
