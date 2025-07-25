// src/pages/AddSubjectPage.jsx
import React, { useState } from 'react';
import '../../styles/EnhancedForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function AddSubjectPage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shortName: '',
    description: '',
    examDetails: '',
    lectureHours: '',
    courseType: 'core',
    syllabus: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { adminData } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const subjectData = {
      code: formData.code,
      name: formData.name,
      shortName: formData.shortName || undefined,
      description: formData.description || undefined,
      examDetails: formData.examDetails,
      lectureHours: parseInt(formData.lectureHours),
      courseType: formData.courseType,
      syllabus: formData.syllabus || undefined,
      isActive: formData.isActive,
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/registersubject`,
        subjectData,
        { withCredentials: true }
      );

      if (response.data.status==="success") {
        setSuccess('Subject added successfully');
        setTimeout(() => navigate('/admin/subjects'), 2000);
      } else {
        throw new Error('Failed to add subject');
      }
    } catch (err) {
      setError('Unable to add subject via backend.');
    }
  };

  return (
    <div className="form-page-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <header className="dashboard-header">
          <h1>Add Subject</h1>
          <p className="dashboard-subtitle">Add a new subject to the system</p>
        </header>
        <div className="form-content-wrapper">
          <form className="enhanced-form add-subject-form" onSubmit={handleSubmit}>
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
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Subject Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="shortName"
                placeholder="Short Name (optional)"
                value={formData.shortName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <textarea
                name="examDetails"
                placeholder="Exam Details (e.g., 40% internals, 60% final exam)"
                value={formData.examDetails}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="lectureHours"
                placeholder="Lecture Hours"
                value={formData.lectureHours}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="input-group">
              <select name="courseType" value={formData.courseType} onChange={handleChange} required>
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            <div className="input-group">
              <textarea
                name="syllabus"
                placeholder="Syllabus (optional, e.g., Unit 1: Algebra, Unit 2: Calculus)"
                value={formData.syllabus}
                onChange={handleChange}
              />
            </div>
            <div className="input-group status"> 
              <label>
                <input
                  className="status2"
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <p>Is Active</p>
              </label>
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="login-button">ADD SUBJECT</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddSubjectPage;