// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import '../../styles/EnhancedForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function StudentRegister() {
  const [formData, setFormData] = useState({
    s_id: '',
    name: '',
    email: '',
    password: '',
    Age: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    dateOfAdmission: '',
    class: '',
    fatherName: '',
    fatherPhoneNumber: '',
    fatherOccupation: '',
    motherName: '',
    motherPhoneNumber: '',
    motherOccupation: '',
    Qualification: '',
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { adminData } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate phone numbers (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Student phone number must be exactly 10 digits');
      return;
    }
    if (formData.fatherPhoneNumber && !/^\d{10}$/.test(formData.fatherPhoneNumber)) {
      setError('Father’s phone number must be exactly 10 digits');
      return;
    }
    if (formData.motherPhoneNumber && !/^\d{10}$/.test(formData.motherPhoneNumber)) {
      setError('Mother’s phone number must be exactly 10 digits');
      return;
    }

    // Prepare student data
    const studentData = new FormData();
    studentData.append('s_id', formData.s_id);
    studentData.append('name', formData.name);
    studentData.append('email', formData.email);
    studentData.append('password', formData.password);
    studentData.append('Age', formData.Age);
    studentData.append('dateOfBirth', formData.dateOfBirth);
    studentData.append('address', formData.address || undefined);
    studentData.append('phone', formData.phone);
    studentData.append('dateOfAdmission', formData.dateOfAdmission);
    studentData.append('class', formData.class);
    studentData.append('fatherName', formData.fatherName);
    studentData.append('fatherPhoneNumber', formData.fatherPhoneNumber);
    studentData.append('fatherOccupation', formData.fatherOccupation || undefined);
    studentData.append('motherName', formData.motherName);
    studentData.append('motherPhoneNumber', formData.motherPhoneNumber);
    studentData.append('motherOccupation', formData.motherOccupation || undefined);
    studentData.append('Qualification', formData.Qualification);
    if (photo) {
      studentData.append('photo', photo);
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/registerstudent`,
        studentData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        setSuccess('Student registered successfully');
        setTimeout(() => navigate('/admin/students'), 2000);
      } else {
        throw new Error('Failed to register student');
      }
    } catch (err) {
      setError('Unable to register student via backend.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <header className="dashboard-header">
          <h1>Register Student</h1>
          <p className="dashboard-subtitle">Add a new student to the system</p>
        </header>
        <div className="login-container" style={{ width: '600px' }}>
          <form className="enhanced-form student-register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="s_id"
                placeholder="Student ID (e.g., S001)"
                value={formData.s_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="Age"
                placeholder="Age"
                value={formData.Age}
                onChange={handleChange}
                required
                min="5"
              />
            </div>
            <div className="input-group">
              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="address"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="phone"
                placeholder="Phone (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="date"
                name="dateOfAdmission"
                placeholder="Date of Admission"
                value={formData.dateOfAdmission}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="class"
                placeholder="Class ID (e.g., CS101)"
                value={formData.class}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherName"
                placeholder="Father's Name"
                value={formData.fatherName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherPhoneNumber"
                placeholder="Father's Phone (10 digits)"
                value={formData.fatherPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="fatherOccupation"
                placeholder="Father's Occupation (optional)"
                value={formData.fatherOccupation}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherName"
                placeholder="Mother's Name"
                value={formData.motherName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherPhoneNumber"
                placeholder="Mother's Phone (10 digits)"
                value={formData.motherPhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="motherOccupation"
                placeholder="Mother's Occupation (optional)"
                value={formData.motherOccupation}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="Qualification"
                placeholder="Qualification (e.g., High School Diploma)"
                value={formData.Qualification}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
            <button type="submit" className="login-button">REGISTER</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default StudentRegister;