// src/pages/DeleteSubjectPage.jsx
import React, { useState } from 'react';
import '../../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function DeleteSubjectPage() {
  const [formData, setFormData] = useState({ code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { adminData } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/subdelete?code=${formData.code}`,
        { withCredentials: true }
      );

      if (response.data.status==="success") {
        setSuccess('Subject deleted successfully');
        setTimeout(() => navigate('/admin/subjects'), 2000);
      } else {
        throw new Error('Failed to delete subject');
      }
    } catch (err) {
      setError('Unable to delete subject via backend.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <header className="dashboard-header">
          <h1>Delete Subject</h1>
          <p className="dashboard-subtitle">Remove a subject from the system</p>
        </header>
        <div className="login-container" style={{ width: '600px' }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="code"
                placeholder="Subject Code (e.g., MATH101)"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="login-button">DELETE SUBJECT</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default DeleteSubjectPage;