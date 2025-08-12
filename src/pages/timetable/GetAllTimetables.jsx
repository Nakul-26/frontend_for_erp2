import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function GetAllTimetables() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ensure API_BASE_URL is correctly defined
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  // Function to check API health
  const checkApiHealth = async () => {
    try {
      // First try a general health endpoint
      const healthEndpoint = `${API_BASE_URL}/api/v1/admin/health`;
      console.log(`Checking API health: ${healthEndpoint}`);
      await axios.get(healthEndpoint, { 
        withCredentials: true,
        timeout: 5000
      });
      console.log('API is available');
      return true;
    } catch (healthError) {
      try {
        // If health endpoint doesn't exist, try another known endpoint
        console.log('Health endpoint failed, trying an alternative endpoint');
        await axios.get(`${API_BASE_URL}/api/v1/admin/getallslots`, { 
          withCredentials: true,
          timeout: 5000
        });
        console.log('API is available via alternative endpoint');
        return true;
      } catch (error) {
        console.error('API connection check failed:', error);
        return false;
      }
    }
  };
  
  // Log API URL on component mount to verify it's correctly set
  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined! Check your .env file for VITE_API_URL');
      setError('API configuration error: Backend URL not defined');
    } else {
      console.log(`API configured with base URL: ${API_BASE_URL}`);
      
      // Check API health on component mount
      checkApiHealth().then(isHealthy => {
        if (!isHealthy) {
          setError('Warning: API server might be unavailable. Please check your network connection or server status.');
        }
      });
    }
  }, []);

  useEffect(() => {
    // Fetch all classes on mount
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
  }, []);

  const fetchTimetables = async (classId) => {
    if (!classId) return;
    setLoading(true);
    setError('');
    setTimetables([]);
    try {
      console.log(`Fetching timetables for class ID: ${classId}`);
      
      // Try multiple endpoints in sequence to find one that works
      const endpoints = [
        // Try the daily schedules endpoint (seems most reliable from other files)
        {
          url: `${API_BASE_URL}/api/v1/admin/getclassdailyschedule/${classId}`,
          name: "Class daily schedule endpoint"
        },
        // Try the get all daily schedules endpoint
        {
          url: `${API_BASE_URL}/api/v1/admin/getalldailyschedules/${classId}`,
          name: "All daily schedules endpoint"
        },
        // Try the standard endpoint from classes API
        {
          url: `${API_BASE_URL}/api/v1/admin/classes/${classId}/timetable`,
          name: "Class-specific timetable endpoint"
        },
        // Try the endpoint used in CreateTimetablePage
        {
          url: `${API_BASE_URL}/api/v1/admin/getClassTimetable/${classId}`,
          name: "Class timetable endpoint"
        },
        // Try plain class details endpoint which might include timetable
        {
          url: `${API_BASE_URL}/api/v1/admin/getclassdetail/${classId}`,
          name: "Class details endpoint"
        }
      ];
      
      let success = false;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting to fetch from: ${endpoint.name} - ${endpoint.url}`);
          
          const res = await axios.get(endpoint.url, { 
            withCredentials: true,
            timeout: 15000 // 15 second timeout
          });
          
          console.log(`${endpoint.name} response:`, res.data);
          
          if (res.data && res.data.data) {
            // Check if the data format is what we expect
            const data = res.data.data;
            if (Array.isArray(data) && data.length > 0 && data[0].day && (data[0].periods || data[0].slots)) {
              setTimetables(data);
              success = true;
              console.log(`Successfully loaded timetable using ${endpoint.name}`);
              break;
            } else if (data.timetable || data.dailySchedules) {
              // Handle nested timetable data
              const timetableData = data.timetable || data.dailySchedules;
              setTimetables(Array.isArray(timetableData) ? timetableData : [timetableData]);
              success = true;
              console.log(`Successfully loaded nested timetable data using ${endpoint.name}`);
              break;
            } else if (Array.isArray(data)) {
              console.log(`Found array data from ${endpoint.name}, checking format...`);
              // Try to adapt the data format
              const adaptedData = data.map(item => {
                // Check if this item has necessary timetable structure
                if (item.day && (item.periods || item.slots)) {
                  return {
                    day: item.day,
                    periods: item.periods || item.slots || []
                  };
                }
                return item;
              });
              
              if (adaptedData.some(item => item.day && (item.periods || item.slots))) {
                setTimetables(adaptedData);
                success = true;
                console.log(`Successfully adapted array data from ${endpoint.name}`);
                break;
              }
            }
          } else if (res.data) {
            // Try to adapt the response format if needed
            if (Array.isArray(res.data) && res.data.length > 0) {
              if (res.data[0].day || res.data[0].dayOfWeek) {
                setTimetables(res.data);
                success = true;
                console.log(`Using direct array data format from ${endpoint.name}:`, res.data);
                break;
              }
            } else if (typeof res.data === 'object') {
              // Try to extract timetable data from response
              const possibleData = res.data.timetable || 
                                 res.data.dailySchedules || 
                                 res.data.schedules ||
                                 res.data;
              
              if (possibleData) {
                const adaptedData = Array.isArray(possibleData) ? possibleData : [possibleData];
                setTimetables(adaptedData);
                success = true;
                console.log(`Extracted timetable data from ${endpoint.name}:`, adaptedData);
                break;
              }
            }
          }
        } catch (err) {
          console.error(`Error with ${endpoint.name}:`, err);
          lastError = err;
          // Continue to the next endpoint
        }
      }
      
      if (!success) {
        throw lastError || new Error('All endpoints failed to return valid timetable data');
      }
    } catch (err) {
      console.error('Error fetching timetables:', err);
      
      // Provide more helpful error messages based on error type
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The server may be overloaded or unreachable.');
      } else if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and ensure the API server is running.');
      } else if (err.response) {
        // The request was made and the server responded with an error status
        setError(`Server error: ${err.response.status} - ${err.response.statusText || err.message}`);
      } else {
        setError(`Failed to fetch timetables: ${err.message || 'Unknown error'}. Please check API endpoint configuration.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"All Timetables"} />
        <div className="timetable-form-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 20 
          }}>
            <div>
              <label htmlFor="class-select" style={{ 
                fontWeight: '600',
                marginRight: '8px',
                color: 'var(--text, #111827)'
              }}>
                Select Class: 
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={e => {
                  const newClassId = e.target.value;
                  setSelectedClass(newClassId);
                  if (newClassId) {
                    fetchTimetables(newClassId);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #d1d5db)',
                  backgroundColor: 'var(--surface, white)',
                  color: 'var(--text, #111827)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  minWidth: '200px'
                }}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.length === 0 ? (
                  <option value="" disabled>Loading classes...</option>
                ) : (
                  classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name || cls.className || `Class ID: ${cls._id}`}
                    </option>
                  ))
                )}
              </select>
            {selectedClass && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{
                    background: 'var(--primary, #6366F1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => navigate(`/admin/timetable/edit/${selectedClass}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5C18.3284 2.5 19 3.17157 19 4C19 4.82843 18.3284 5.5 17.5 5.5M17.5 2.5C16.6716 2.5 16 3.17157 16 4C16 4.82843 16.6716 5.5 17.5 5.5M17.5 2.5L8 12L6 18L12 16L17.5 10.5M17.5 5.5L19 7L17.5 8.5" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Timetable
                </button>
                <button
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete the entire timetable for this class?')) return;
                    try {
                      await axios.delete(`${API_BASE_URL}/api/v1/admin/deletedailyschedule/${selectedClass}`, { withCredentials: true });
                      setTimetables([]);
                      setError('');
                    } catch (err) {
                      setError(err.response?.data?.message || 'Failed to delete timetable.');
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete Timetable
                </button>
              </div>
            )}
            </div>
            <button
              onClick={() => navigate('/admin/timetable/create')}
              style={{
                backgroundColor: 'var(--primary, #6366f1)',
                color: 'var(--text-light, white)',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.backgroundColor = 'var(--primary-dark, #4f46e5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))';
                e.currentTarget.style.backgroundColor = 'var(--primary, #6366f1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Create Timetable
            </button>
          </div>
          {loading && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '20px', 
              color: '#6366f1', 
              gap: '8px' 
            }}>
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading timetables...
            </div>
          )}
          {error && (
            <div style={{ 
              padding: '16px 20px', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M8.28902 3H15.711C16.5081 3 17.2566 3.4059 17.6956 4.06546L21.1069 9.57639C21.4391 10.1137 21.5996 10.7509 21.5641 11.3924L21.1603 17.3924C21.0907 18.444 20.2149 19.2636 19.1634 19.2636H4.83655C3.78512 19.2636 2.90927 18.444 2.83973 17.3924L2.43591 11.3924C2.40044 10.7509 2.56086 10.1137 2.89311 9.57639L6.30435 4.06546C6.74343 3.4059 7.49187 3 8.28902 3Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <strong>Error:</strong>
              </div>
              <div>{error}</div>
              
              <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                <strong>Troubleshooting:</strong>
                <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                  <li>Check if the API server is running</li>
                  <li>Verify your network connection</li>
                  <li>Try refreshing the page</li>
                  <li>Check if the class has a timetable created</li>
                </ul>
                
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      if (selectedClass) {
                        fetchTimetables(selectedClass);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#fff',
                      border: '1px solid #dc2626',
                      color: '#dc2626',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.85rem'
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}
          {timetables.length === 0 && !loading && selectedClass && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '6px', 
              color: '#4b5563',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '12px' }}>No timetables found for this class.</p>
              <p>You can create a new timetable by clicking the "Create Timetable" button or by navigating to the edit page.</p>
            </div>
          )}
          {timetables.length > 0 && (
            <div style={{ marginBottom: 32, background: 'var(--surface)', borderRadius: 8, padding: 16 }}>
              <h3 style={{ color: 'var(--text)' }}>Class: {timetables[0].classId?.name || timetables[0].classId}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="timetable-table" style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 2px 8px var(--border-color)' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'var(--text-light)' }}>
                      <th>Day / Time Slot</th>
                      {(() => {
                        // Collect all unique periods from all days
                        const allPeriods = [];
                        timetables.forEach(tt => {
                          tt.periods?.forEach(p => {
                            if (!allPeriods.find(ap => ap._id === p.period?._id)) {
                              allPeriods.push(p.period);
                            }
                          });
                        });
                        return allPeriods.map(slot => (
                          <th key={slot?._id}>
                            {slot?.period}<br />
                            <small style={{ color: 'var(--text-light)' }}>{slot?.startTime} - {slot?.endTime}</small>
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                      <tr key={day} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{day}</td>
                        {(() => {
                          // Find the timetable for this day
                          const ttDay = timetables.find(tt => tt.day === day);
                          // Get all unique periods
                          const allPeriods = [];
                          timetables.forEach(tt => {
                            tt.periods?.forEach(p => {
                              if (!allPeriods.find(ap => ap._id === p.period?._id)) {
                                allPeriods.push(p.period);
                              }
                            });
                          });
                          return allPeriods.map(slot => {
                            // Find the period for this slot in this day
                            const periodObj = ttDay?.periods?.find(p => p.period?._id === slot?._id);
                            if (!periodObj) return <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}><em>-</em></td>;
                            // If break, show break
                            if (periodObj.period?.period?.toLowerCase().includes('break')) {
                              return <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}><em>{periodObj.period?.period}</em></td>;
                            }
                            return (
                              <td key={slot?._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                                <div>
                                  <b style={{ color: 'var(--text)' }}>{periodObj.mapped?.subjectId?.name || periodObj.mapped?.subjectId?.code || '-'}</b><br />
                                  <span style={{ color: 'var(--text)' }}>{periodObj.mapped?.teacherId?.name || periodObj.mapped?.teacherId?.email || '-'}</span>
                                </div>
                              </td>
                            );
                          });
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetAllTimetables;
