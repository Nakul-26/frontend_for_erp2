import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function GenerateTimetablePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ensure API_BASE_URL is correctly defined
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Check API health on mount
  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined! Check your .env file for VITE_API_URL');
      setError('API configuration error: Backend URL not defined');
    } else {
      console.log(`API configured with base URL: ${API_BASE_URL}`);
    }
  }, []);

  // Fetch all classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { 
          withCredentials: true,
          timeout: 8000 // 8 second timeout
        });
        console.log('Classes fetched:', res.data);
        setClasses(res.data.data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(`Failed to fetch classes: ${err.message || 'Unknown error'}`);
        setClasses([]);
      }
    };
    
    fetchClasses();
  }, [API_BASE_URL]);

  // Function to auto-generate timetable
  const generateTimetable = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`Generating timetable for class: ${selectedClass}`);
      
      // Call the backend API to auto-generate the timetable
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/generateTimetable/${selectedClass}`,
        {},  // Empty body as we're not sending any data
        { 
          withCredentials: true,
          timeout: 20000 // 20 second timeout for potentially long operation
        }
      );
      
      console.log('Timetable generation response:', response.data);
      
      // Check if the response contains success message
      if (response.data && response.data.success) {
        setSuccess('Timetable successfully generated! You can now view or edit it.');
        // Optionally navigate to view the generated timetable
        setTimeout(() => {
          navigate(`/admin/timetable/getall`);
        }, 2000);
      } else {
        setError('Timetable generation completed but no success confirmation was received');
      }
    } catch (err) {
      console.error('Error generating timetable:', err);
      
      // Provide more helpful error messages based on error type
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Timetable generation may take longer than expected or server may be overloaded.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error while generating timetable. Please check your internet connection.');
      } else if (err.response) {
        // The request was made and the server responded with an error status
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.response.statusText || err.message}`);
      } else {
        setError(`Failed to generate timetable: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar pageTitle="Generate Timetable" />
        <div className="timetable-form-container">
          <div className="form-header">
            <h1>Automatic Timetable Generation</h1>
            <p>This tool will automatically generate a complete timetable for the selected class based on available teachers, subjects, and time slots.</p>
          </div>

          {error && (
            <div className="error-message" style={{ 
              padding: '12px 16px', 
              backgroundColor: '#FEE2E2', 
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
              borderRadius: '4px',
              marginBottom: '20px' 
            }}>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {success && (
            <div className="success-message" style={{ 
              padding: '12px 16px', 
              backgroundColor: '#ECFDF5', 
              color: '#065F46',
              border: '1px solid #6EE7B7',
              borderRadius: '4px',
              marginBottom: '20px' 
            }}>
              <p style={{ margin: 0 }}>{success}</p>
            </div>
          )}

          <form onSubmit={generateTimetable}>
            <div className="form-group">
              <label htmlFor="class-select" style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text, #333)',
                display: 'block',
                marginBottom: '8px'
              }}>Select Class:</label>
              <select 
                id="class-select" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-background, white)',
                  color: 'var(--input-text, #333)',
                  width: '100%',
                  maxWidth: '400px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <option value="">-- Select Class --</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name || cls.className || `Class ID: ${cls._id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions" style={{ marginTop: '32px' }}>
              <button
                type="submit"
                disabled={loading || !selectedClass}
                style={{
                  backgroundColor: loading || !selectedClass ? 'var(--disabled, #9CA3AF)' : 'var(--primary, #6366f1)',
                  color: 'var(--text-light, white)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: !selectedClass || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32 32" strokeDashoffset="0">
                        <animateTransform 
                          attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 9L21 3M12 12L3 3H21L12 12ZM12 12L21 21H3L12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Generate Timetable
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/timetable/getall')}
                style={{
                  backgroundColor: 'var(--surface, white)',
                  color: 'var(--text, #333)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginLeft: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="info-box" style={{ 
            marginTop: '40px', 
            padding: '16px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '4px',
            maxWidth: '800px'
          }}>
            <h3 style={{ fontSize: '1.125rem', marginTop: 0 }}>How Automatic Timetable Generation Works</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>The system will analyze available teachers and their assigned subjects</li>
              <li>Time slots will be distributed to avoid teacher conflicts</li>
              <li>The algorithm attempts to optimize the schedule for best learning conditions</li>
              <li>You can edit the generated timetable afterwards if needed</li>
              <li>If generation fails, you can always create a timetable manually</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GenerateTimetablePage;
