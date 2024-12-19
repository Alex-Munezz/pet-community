import React, { useEffect, useState } from 'react';
import './App.css'; // Import custom CSS file

const Dashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('User not logged in');
      return;
    }
  
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const response = await fetch(`http://127.0.0.1:5000/users/${user}`);
        const data = await response.json();
        console.log('User data:', data);
  
        if (data.status === 'success') {
          setUserData(data.data);
        } else {
          console.error('Failed to fetch user data:', data.message);
        }
  
        // Fetch pets data
        const token = localStorage.getItem('access_token');
        console.log('Retrieved Token:', token);
        if (!token) {
          console.error('No access token found in localStorage');
          return;
        }
  
        const authorizationHeader = `Bearer ${token}`;
        console.log('Authorization Header:', authorizationHeader); // Debugging
  
        const petsResponse = await fetch('http://127.0.0.1:5000/pets', {
          method: 'GET',
          headers: {
            'Authorization': authorizationHeader,
          },
        });
  
        if (!petsResponse.ok) {
          console.error('Failed to fetch pets, status:', petsResponse.status);
          return;
        }
  
        const petsData = await petsResponse.json();
        console.log('Pets Data:', petsData);  // Debugging pets data
  
        if (petsData.status === 'success' && petsData.data) {
          setPets(petsData.data);
        } else {
          console.error('Failed to fetch pets or no pets found:', petsData.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [user]);
  

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      {loading ? (
        <p className="loading-text">Loading user details and pets...</p>
      ) : (
        <div className="user-info-card">
          {userData && (
            <div className="user-details">
              <h2 className="username">Welcome, {userData.username}</h2>
              <p className="email">Email: {userData.email}</p>
            </div>
          )}

          {pets.length > 0 ? (
            <div>
              <h3 className="pets-title">Your Pets</h3>
              <div className="pets-grid">
                {pets.map((pet) => (
                  <div key={pet.id} className="pet-card">
                    <h4 className="pet-name">{pet.name}</h4>
                    <p className="pet-species">Species: {pet.species}</p>
                    <p className="pet-age">Age: {pet.age} years</p>
                    <p className="pet-description">Description: {pet.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-pets">No pets found for this user.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
