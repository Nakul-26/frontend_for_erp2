import React, { useState } from 'react';
import '../../styles/Login.css'; // Reuse Login.css for similar styling
import { FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherChangePassword() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'https://your-backend-domain.com/teacher/changepassword',
        { oldpassword: oldPassword, newpassword: newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully');
        setTimeout(() => navigate('/teacher/dashboard'), 2000); // Redirect after 2s
      } else {
        setError('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="avatar">
          <FaLock size={40} color="#fff" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              className="error-message"
              style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="success-message"
              style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}
            >
              {success}
            </div>
          )}

          <button type="submit" className="login-button">CHANGE PASSWORD</button>
        </form>
      </div>
    </div>
  );
}

export default TeacherChangePassword;