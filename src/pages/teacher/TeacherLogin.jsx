import React, { useState } from 'react';
import '../../styles/Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherLogin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Keep this, you'll need it for error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // --- THIS IS THE FIX ---
    e.preventDefault(); // Prevents the default form submission behavior (page reload)
    // --- END FIX ---

    setError(''); // Clear previous errors

    // Correctly access environment variable using import.meta.env
    // Make sure your .env file has VITE_API_URL defined (e.g., VITE_API_URL=http://localhost:5000)
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/teacher/login`,
        { id: userId, "password":password },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('Teacher login successful');
        console.log(response); // Corrected typo: console.log(response)
        localStorage.setItem('teacherData', JSON.stringify(response.data.data));
        navigate('/teacher/dashboard'); // Use absolute path from root
      } else {
        // If backend responds with success: false
        setError(response.data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) { // Changed 'error' to 'err' to avoid confusion with the state variable
      console.error('Login Error:', err); // Log the full error for debugging

      // Corrected logic to display error message
      if (err.response) {
        // The request was made and the server responded with a status code that falls out of the range of 2xx
        setError(err.response.data.message || 'Login failed. Please check your inputs.');
      } else if (err.request) {
        // The request was made but no response was received (e.g., network error, server down)
        setError('No response from server. Please check your network or try again later.');
      } else {
        // Something else happened in setting up the request
        setError('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div className="login2-background">
      <div className="login2-container">
        <div className="avatar2">
          <FaUser size={40} color="#fff" />
        </div>
        <form className="login2-form" onSubmit={handleSubmit}>
          <div className="input2-group">
            <FaUser className="input2-icon" />
            <input
              type="text"
              placeholder="Teacher ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="input2-group">
            <FaLock className="input2-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Uncomment the error display. It's crucial for user feedback! */}
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div className="login2-options">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="login2-button">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

export default TeacherLogin;