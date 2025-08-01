import React, { useState } from 'react';
import '../../styles/Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Auth Context for login state

function AdminLogin() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Use authentication context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    if (!API_BASE_URL) {
      setError('Server configuration error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/login`,
        { id: userId, password: password },
        { withCredentials: true }
      );

      if (response.data.success) {
        // console.log('Login successful');
        // console.log(response);
        console.log(response.data.data);
        // Store admin data in context only
        login(response.data.data); // Update auth context
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please check your Admin ID and password.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Server error. Try again later.');
    } finally {
      setIsLoading(false);
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
              placeholder="Admin ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div className="login2-options">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="login2-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
