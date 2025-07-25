// src/pages/MappedPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Login.css'; // Assuming you have general form styling here
import '../../styles/Dashboard.css'; // For overall layout
import '../../styles/Mapped.css'; // For radio button styling (will need updates in Mapped.css)
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function MappedPage() {
  // Removed inputId state
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Changed to single IDs instead of arrays
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth(); // Assuming adminData might be used for auth headers etc.

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Function to fetch all necessary data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Subjects
        const subjectsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallsubjectformapped`, { withCredentials: true });
        console.log('Subjects Response:', subjectsResponse); // Debugging: Check the response format
        if (subjectsResponse.data.success === true && Array.isArray(subjectsResponse.data.data)) {
          setSubjects(subjectsResponse.data.data);
        } else {
          throw new Error('Failed to fetch subjects or invalid format.');
        }

        // Fetch Classes
        const classesResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
        console.log('Classes Response:', classesResponse); // Debugging: Check the response format
        if (classesResponse.data.success && Array.isArray(classesResponse.data.data)) {
          setClasses(classesResponse.data.data);
        } else {
          throw new Error('Failed to fetch classes or invalid format.');
        }

        // Fetch Teachers
        const teachersResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallteacherformapped`, { withCredentials: true });
        console.log('Teachers Response:', teachersResponse); // Debugging: Check the response format
        if (teachersResponse.data.success && Array.isArray(teachersResponse.data.data)) {
          setTeachers(teachersResponse.data.data);
        } else {
          throw new Error('Failed to fetch teachers or invalid format.');
        }

      } catch (err) {
        console.error('Error fetching data for Mapped Page:', err);
        setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (API_BASE_URL) {
      fetchAllData();
    } else {
      setError('API Base URL is not defined.');
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Removed handleInputChange as inputId is removed

  // Handler for radio button selection
  const handleRadioChange = (e, type) => {
    const { value } = e.target;
    if (type === 'subject') {
      setSelectedSubject(value);
    } else if (type === 'class') {
      setSelectedClass(value);
    } else if (type === 'teacher') {
      setSelectedTeacher(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if one of each is selected
    if (!selectedSubject || !selectedClass || !selectedTeacher) {
      setError('Please select one subject, one class, and one teacher.');
      return;
    }

    const payload = {
      subjectId: selectedSubject,
      classId: selectedClass,
      teacherId: selectedTeacher,
    };

    console.log('Sending payload:', payload); // Debugging: Check the payload before sending

    try {
      // This endpoint now directly matches your backend's `createMapped` function
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/createmapped`, // Assuming your backend route is this for the `createMapped` function
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Mapping created successfully!');
        // Clear selections after successful submission
        setSelectedSubject('');
        setSelectedClass('');
        setSelectedTeacher('');
      } else {
        setError(response.data.message || 'Mapping failed.');
      }
    } catch (err) {
      console.error('Mapping submission error:', err);
      setError(err.response?.data?.message || 'An error occurred during mapping.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <header className="dashboard-header">
          <h1>Create New Mapping</h1>
          <p className="dashboard-subtitle">Link a specific class, subject, and teacher</p>
        </header>

        <div className="login-container" style={{ width: '80%', maxWidth: '800px', padding: '30px' }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Create Class-Subject-Teacher Mapping</h2>

            {loading ? (
              <div style={{ textAlign: 'center', margin: '20px 0', color: '#555' }}>Loading data...</div>
            ) : (
              <>
                {/* Select Subjects */}
                <div className="radio-group-section"> {/* Changed from checkbox-group-section */}
                  <h3>Select Subject:</h3>
                  {subjects.length > 0 ? (
                    <div className="radio-grid"> {/* Changed from checkbox-grid */}
                      {subjects.map(subject => (
                        <label key={subject._id} className="radio-label"> {/* Changed from checkbox-label */}
                          <input
                            type="radio" // Changed to radio
                            name="subject" // Name attribute for radio button group
                            value={subject._id}
                            checked={selectedSubject === subject._id} // Check against single selectedSubject
                            onChange={(e) => handleRadioChange(e, 'subject')}
                            required // Require one subject to be selected
                          />
                          {subject.name} ({subject.code})
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p>No subjects available.</p>
                  )}
                </div>

                {/* Select Classes */}
                <div className="radio-group-section">
                  <h3>Select Class:</h3>
                  {classes.length > 0 ? (
                    <div className="radio-grid">
                      {classes.map(cls => (
                        <label key={cls.classId} className="radio-label">
                          <input
                            type="radio" // Changed to radio
                            name="class" // Name attribute for radio button group
                            value={cls._id}
                            checked={selectedClass === cls._id} // Check against single selectedClass
                            onChange={(e) => handleRadioChange(e, 'class')}
                            required // Require one class to be selected
                          />
                          {cls.name} (ID: {cls.classId})
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p>No classes available.</p>
                  )}
                </div>

                {/* Select Teachers */}
                <div className="radio-group-section">
                  <h3>Select Teacher:</h3>
                  {teachers.length > 0 ? (
                    <div className="radio-grid">
                      {teachers.map(teacher => (
                        <label key={teacher._id || teacher.id} className="radio-label">
                          <input
                            type="radio" // Changed to radio
                            name="teacher" // Name attribute for radio button group
                            value={teacher._id || teacher.id}
                            checked={selectedTeacher === (teacher._id || teacher.id)} // Check against single selectedTeacher
                            onChange={(e) => handleRadioChange(e, 'teacher')}
                            required // Require one teacher to be selected
                          />
                          {teacher.name} ({teacher.id || teacher.email})
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p>No teachers available.</p>
                  )}
                </div>
              </>
            )}

            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginTop: '20px' }}>{success}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Submitting...' : 'CREATE MAPPING'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default MappedPage;