import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
//import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Navbar({ role, toggleSidebar }) {
  const [adminData, setAdminData] = useState(null); // Uncomment if needed
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  //const { logout } = useAuth();
  const navigate = useNavigate();

  //If you plan to use adminData, uncomment the lines above and below
   useEffect(() => {
    const response = JSON.parse(localStorage.getItem('admindata'));
    if (response?.data?.admindata) {
      setAdminData(response.data.admindata);
    }
    
  }, []);

  const handleLogout = async () => {
    try {
      // console.log(response.role.data);
      const response = await axios.post(
        'https://quantumx-wmbl.onrender.com/api/v1/admin/logout',
        {}, // Empty body as per backend requirements
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data) {
        console.log('Logout successful');
        // Clear all local storage data
        localStorage.clear();
        // Redirect to login page
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      
      // Always clear local storage and redirect on error
      // This ensures user is logged out client-side even if server request fails
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <header className="dashboard-header">
      <button
        className="menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <h1> Dashboard</h1>
      <div className="header-actions">
        <button className="profile-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div
        className={`sidebar-overlay ${isOverlayOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </header>
  );
}

export default Navbar;