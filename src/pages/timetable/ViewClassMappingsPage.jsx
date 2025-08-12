import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

// Define CSS for responsive design
const responsiveStyles = {
  // Mobile styles
  mobile: `
    @media (max-width: 640px) {
      .table-wrapper {
        padding: 8px !important;
      }
      .timetable-table th, 
      .timetable-table td {
        padding: 8px !important;
      }
      .delete-text {
        display: none !important;
      }
      .status-message {
        padding: 8px 12px !important;
      }
      .create-mapping-btn {
        padding: 8px 12px !important;
        font-size: 0.875rem !important;
      }
    }
  `,
  
  // Tablet styles
  tablet: `
    @media (max-width: 768px) {
      .main-content {
        padding: 12px !important;
      }
      .timetable-form-container {
        padding: 16px 12px !important;
      }
    }
  `,
};

function ViewClassMappingsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
    }
  };

  const fetchMappings = async (classId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      setMappings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch mappings.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setMappings([]);
    if (classId) {
      fetchMappings(classId);
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/deletemapped/${mappingId}`, { withCredentials: true });
      setSuccess('Mapping deleted successfully.');
      setMappings(mappings.filter(m => m._id !== mappingId));
    } catch (err) {
      setError('Failed to delete mapping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <style>{responsiveStyles.mobile}</style>
      <style>{responsiveStyles.tablet}</style>
      <Sidebar />
      <main className="main-content" style={{ 
        fontSize: '18px',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Navbar pageTitle={"View Class Mappings"} />
        {/* Add create mapping button at the top right */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          padding: '0 16px 16px',
          boxSizing: 'border-box'
        }}>
          <button 
            onClick={() => navigate('/admin/mapped')}
            className="create-mapping-btn"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-light)',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create Mapping
          </button>
        </div>
        <div className="timetable-form-container" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          flexGrow: 1,
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          padding: '16px',
          margin: '0 auto',
          boxSizing: 'border-box',
          maxWidth: '100%'
        }}>
          {/* Status Messages */}
          {loading && (
            <div className="status-message" style={{ 
              textAlign: 'center', 
              padding: '12px 20px',
              backgroundColor: 'var(--primary-light, #eef2ff)', 
              borderRadius: '8px',
              color: 'var(--primary)',
              width: '100%',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <div className="loading-spinner" style={{ 
                width: '20px', 
                height: '20px', 
                border: '3px solid var(--primary-light)', 
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              Loading mappings...
            </div>
          )}
          {error && (
            <div className="status-message error" style={{ 
              textAlign: 'center',
              padding: '12px 20px',
              backgroundColor: 'var(--danger-light, #FEE2E2)', 
              borderRadius: '8px',
              color: 'var(--danger)',
              width: '100%',
              marginBottom: '20px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="status-message success" style={{ 
              textAlign: 'center',
              padding: '12px 20px',
              backgroundColor: 'var(--success-light, #DCFCE7)', 
              borderRadius: '8px',
              color: 'var(--success)',
              width: '100%',
              marginBottom: '20px',
              fontWeight: '500'
            }}>
              ✅ {success}
            </div>
          )}
          
          {/* Class Selection - Improved for responsive design */}
          <div style={{ 
            marginBottom: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%',
            maxWidth: '100%',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              maxWidth: '600px'
            }}>
              <label htmlFor="class-select" style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '6px',
                alignSelf: 'center'
              }}>
                Select Class:
              </label>
              <select 
                id="class-select" 
                value={selectedClass} 
                onChange={handleClassChange} 
                required 
                style={{ 
                  fontSize: '1rem', 
                  padding: '8px 16px', 
                  flex: '1',
                  minWidth: '240px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px',
                  textAlign: 'left',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <option value="">-- Select Class --</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
                ))}
              </select>
            </div>
            
            {selectedClass && (
              <div style={{
                padding: '6px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-light)',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginTop: '12px',
                display: 'inline-block'
              }}>
                Class Selected: {classes.find(c => c._id === selectedClass)?.name || classes.find(c => c._id === selectedClass)?.className || 'Selected'}
              </div>
            )}
          </div>
          <div style={{ 
            width: '100%', 
            margin: 0, 
            overflowX: 'auto', 
            display: 'block',
            borderRadius: '12px'
          }}>
            {selectedClass && mappings.length > 0 && (
              <div style={{ 
                width: '100%', 
                display: 'block',
                maxWidth: '100%'
              }}>
                <h3 style={{
                  fontSize: '1.375rem',
                  fontWeight: '600',
                  marginBottom: '18px',
                  color: 'var(--text)',
                  textAlign: 'center'
                }}>
                  Class Mappings
                </h3>
                <div style={{ 
                  width: '100%',
                  overflowX: 'auto',
                  borderRadius: '12px'
                }}>
                <table className="timetable-table" style={{
                  width: '100%',
                  minWidth: '100%',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  borderCollapse: 'collapse',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  margin: '0 auto',
                  textAlign: 'left'
                }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary)', color: 'var(--text-light)' }}>
                    <th style={{ 
                      padding: '14px 20px', 
                      fontWeight: '600',
                      fontSize: '1rem',
                      borderTopLeftRadius: '8px',
                      whiteSpace: 'nowrap',
                      width: '45%'
                    }}>Subject</th>
                    <th style={{ 
                      padding: '14px 20px', 
                      fontWeight: '600',
                      fontSize: '1rem',
                      whiteSpace: 'nowrap'
                    }}>Teacher</th>
                    <th style={{ 
                      padding: '14px 20px', 
                      fontWeight: '600',
                      fontSize: '1rem',
                      textAlign: 'center',
                      borderTopRightRadius: '8px',
                      width: '10%'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => {
                    // Get subject and teacher names
                    const subjectName = mapping.subjectName ||
                      mapping.subject?.name ||
                      (typeof mapping.subjectId === 'object' ? 
                        (mapping.subjectId.name || mapping.subjectId.code || mapping.subjectId.shortName || mapping.subjectId._id) 
                        : mapping.subjectId);
                      
                    const teacherName = mapping.teacherName ||
                      mapping.teacher?.name ||
                      (typeof mapping.teacherId === 'object' ? 
                        (mapping.teacherId.name || mapping.teacherId.code || mapping.teacherId.shortName || mapping.teacherId._id) 
                        : mapping.teacherId);
                        
                    return (
                      <tr 
                        key={mapping._id} 
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-alt, #f9fafb)',
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--input-background-dark, #f3f4f6)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-alt, #f9fafb)';
                        }}
                      >
                        <td style={{ 
                          padding: '12px 20px', 
                          color: 'var(--text)', 
                          fontWeight: '500',
                          ...(idx === mappings.length - 1 ? { borderBottomLeftRadius: '8px' } : {})
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            flexWrap: 'nowrap'
                          }}>
                            <span style={{ 
                              backgroundColor: 'var(--primary-light, #eef2ff)', 
                              minWidth: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '10px',
                              color: 'var(--primary)',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}>
                              {subjectName.slice(0, 2).toUpperCase()}
                            </span>
                            <span style={{ 
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto',
                              maxWidth: 'calc(100% - 40px)'
                            }}>
                              {subjectName}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '12px 20px', 
                          color: 'var(--text)',
                          fontWeight: '500'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            flexWrap: 'nowrap'
                          }}>
                            <span style={{ 
                              backgroundColor: 'var(--secondary-light, #e0f2fe)', 
                              minWidth: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '8px',
                              color: 'var(--secondary, #0284c7)',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}>
                              {teacherName.slice(0, 2).toUpperCase()}
                            </span>
                            <span style={{ 
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto',
                              maxWidth: 'calc(100% - 40px)'
                            }}>
                              {teacherName}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '12px 20px',
                          textAlign: 'center',
                          ...(idx === mappings.length - 1 ? { borderBottomRightRadius: '8px' } : {})
                        }}>
                          <button 
                            onClick={() => handleDelete(mapping._id)} 
                            disabled={loading} 
                            style={{ 
                              color: 'white', 
                              backgroundColor: 'var(--danger)',
                              border: 'none',
                              borderRadius: '4px', 
                              padding: '7px 16px', 
                              fontWeight: '500', 
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              width: 'auto',
                              margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--danger-dark)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--danger)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="delete-text">Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
                <div style={{ 
                  marginTop: '16px', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--surface-alt, #f9fafb)',
                  borderRadius: '8px',
                  color: 'var(--text-muted, #6b7280)',
                  fontSize: '0.875rem'
                }}>
                  <span>Total mappings: <strong>{mappings.length}</strong></span>
                  <span>Last updated: <strong>{new Date().toLocaleDateString()}</strong></span>
                </div>
              </div>
            )}
            {selectedClass && mappings.length === 0 && !loading && (
              <div style={{
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: 'var(--surface-alt, #f9fafb)',
                borderRadius: '12px',
                color: 'var(--text-muted, #6b7280)',
                width: '100%',
                margin: '20px 0',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
                <h3 style={{ color: 'var(--text)', marginBottom: '8px', fontWeight: '600' }}>No Mappings Found</h3>
                <p style={{ maxWidth: '100%', margin: '0 auto', padding: '0 8px' }}>
                  There are no subject-teacher mappings for this class yet. 
                  <br />
                  <button 
                    onClick={() => navigate('/admin/mapped')}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      margin: '16px auto 0'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Mapping
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewClassMappingsPage;
