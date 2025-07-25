// src/pages/SearchSubjectPage.jsx
import React, { useState } from 'react';
import '../../styles/Login.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function SearchSubjectPage() {
  const [searchData, setSearchData] = useState({ code: '' });
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth();

  const handleChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearchResult(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/sub?code=${searchData.code}`,
        { withCredentials: true }
      );

      if (response.data.status==="success") {
        setSearchResult(response.data.subject);
        setSuccess('Subject found!');
      } else {
        throw new Error('Subject not found');
      }
    } catch (err) {
      setError('Unable to fetch subject from backend.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <header className="dashboard-header">
          <h1>Search Subject</h1>
          <p className="dashboard-subtitle">Find a subject by code</p>
        </header>
        <div className="login-container" style={{ width: '600px' }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="code"
                placeholder="Subject Code (e.g., MATH101)"
                value={searchData.code}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            {searchResult && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <h3>Subject Details:</h3>
                <p><strong>Code:</strong> {searchResult.code}</p>
                <p><strong>Name:</strong> {searchResult.name}</p>
                <p><strong>Short Name:</strong> {searchResult.shortName || 'N/A'}</p>
                <p><strong>Description:</strong> {searchResult.description || 'N/A'}</p>
                <p><strong>Exam Details:</strong> {searchResult.examDetails}</p>
                <p><strong>Lecture Hours:</strong> {searchResult.lectureHours}</p>
                <p><strong>Course Type:</strong> {searchResult.courseType}</p>
                <p><strong>Syllabus:</strong> {searchResult.syllabus || 'N/A'}</p>
                <p><strong>Active:</strong> {searchResult.isActive ? 'Yes' : 'No'}</p>
              </div>
            )}
            <button type="submit" className="login-button">SEARCH SUBJECT</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SearchSubjectPage;