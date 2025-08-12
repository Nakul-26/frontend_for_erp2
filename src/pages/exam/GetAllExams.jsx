import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function GetAllExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  // Custom CSS for table improvements
  const tableStyles = {
    examTable: {
      borderSpacing: '0',
      width: '100%',
      marginTop: '10px',
      boxShadow: 'var(--shadow-md)'
    },
    tableHead: {
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => {
        setExams(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load exams. Please try again.');
        setLoading(false);
      });
  }, [API_BASE_URL]);

  const handleModify = (id) => {
    navigate(`/admin/exams/update/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    setDeletingId(id);
    setMessage('');
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/exam/${id}`, { withCredentials: true });
      setExams(exams => exams.filter(e => e._id !== id));
      setMessage('Exam deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
    setDeletingId(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"All Exams"} />
        <div style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          <div className="timetable-form-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-heading, var(--text))' }}>Exam List</h2>
              <button 
                onClick={() => navigate('/admin/exams/create')}
                style={{
                  background: 'var(--primary)',
                  color: 'var(--text-light)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Create Exam
              </button>
            </div>
            
            {message && <p className="status-message success">{message}</p>}
            {error && <p className="status-message error">{error}</p>}
            
            {loading ? <p style={{ textAlign: 'center', padding: '20px' }}>Loading exams...</p> : (
              <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
                <table className="timetable-table" style={tableStyles.examTable}>
                  <thead style={tableStyles.tableHead}>
                    <tr>
                      <th style={{ width: '25%' }}>Exam Name</th>
                      <th style={{ width: '15%' }}>Class</th>
                      <th style={{ width: '15%' }}>Date</th>
                      <th style={{ width: '25%' }}>Subjects</th>
                      <th style={{ width: '20%' }}>Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No exams found</td>
                    </tr>
                  ) : (
                    exams.map(exam => (
                      <tr key={exam._id} style={{ transition: 'background-color 0.2s' }} 
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.05))'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                        <td>{exam.examName}</td>
                        <td>{exam.classId?.name || '-'}</td>
                        <td>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}</td>
                        <td>{exam.subjects?.map(s => s.subjectId?.name).join(', ') || '-'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button 
                            onClick={() => handleModify(exam._id)} 
                            style={{ 
                              marginRight: '8px', 
                              background: 'var(--primary, #2563eb)', 
                              color: 'var(--text-light, #fff)', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '8px 12px', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-dark, #1d4ed8)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary, #2563eb)'}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(exam._id)} 
                            style={{ 
                              background: 'var(--danger, #dc2626)', 
                              color: 'var(--text-light, #fff)', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '8px 12px', 
                              fontWeight: '600', 
                              cursor: deletingId === exam._id ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s'
                            }}
                            disabled={deletingId === exam._id}
                            onMouseOver={(e) => !deletingId && (e.currentTarget.style.background = 'var(--danger-dark, #b91c1c)')}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--danger, #dc2626)'}
                          >
                            {deletingId === exam._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GetAllExams;
