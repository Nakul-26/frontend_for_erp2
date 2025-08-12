// ExamResultsByExam.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function ExamResultsByExam() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => setExams(res.data.data || []));
  }, []);

  const fetchResults = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/v1/admin/examresult/exam/${selectedExam}`, { withCredentials: true });
      setResults(res.data.data || []);
      if (res.data.data?.length === 0) {
        alert('No results found for this exam');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setResults([]);
      alert('Error fetching results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar pageTitle={"Results by Exam"} />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: 'var(--surface)', color: 'var(--text)', padding: 'clamp(16px, 5vw, 32px)', borderRadius: 12, boxShadow: '0 2px 8px var(--border-color)' }}>
          {/* Header with action buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontWeight: 700 }}>Exam Results</h2>
            
            {/* Responsive button container */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px'
            }}>
              <button 
                onClick={() => window.location.href = '/admin/examresult/create'} 
                style={{
                  padding: '8px 12px',
                  background: 'var(--primary, #6366f1)',
                  color: 'var(--text-light, #ffffff)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  flex: '1 1 auto',
                  minWidth: '120px',
                  justifyContent: 'center',
                  maxWidth: '200px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  e.currentTarget.style.background = 'var(--primary-dark, #4f46e5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = 'var(--primary, #6366f1)';
                }}
              >
                <span>➕</span> Publish Results
              </button>
              
              <button 
                onClick={() => selectedExam ? 
                  window.location.href = `/admin/examresult/update/${selectedExam}` : 
                  alert('Please select an exam first')
                } 
                style={{
                  padding: '8px 12px',
                  background: 'var(--primary, #6366f1)',
                  color: 'var(--text-light, #ffffff)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  flex: '1 1 auto',
                  minWidth: '120px',
                  justifyContent: 'center',
                  maxWidth: '200px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  e.currentTarget.style.background = 'var(--primary-dark, #4f46e5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = 'var(--primary, #6366f1)';
                }}
              >
                <span>✏️</span> Update Results
              </button>
            </div>
          </div>
          
          <select onChange={e => setSelectedExam(e.target.value)} value={selectedExam} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
          </select>
          <button 
            onClick={fetchResults} 
            disabled={!selectedExam || loading}
            style={{
              marginBottom: 20,
              padding: '8px 16px',
              background: 'var(--primary)',
              color: 'var(--text-light)',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 'clamp(14px, 3vw, 16px)',
              cursor: selectedExam && !loading ? 'pointer' : 'not-allowed',
              boxShadow: '0 1px 4px var(--border-color)',
              transition: 'all 0.2s ease',
              opacity: (!selectedExam || loading) ? 0.7 : 1,
              width: 'fit-content',
              minWidth: '120px',
              maxWidth: '200px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              if (selectedExam && !loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                e.currentTarget.style.background = 'var(--primary-dark, #4338ca)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px var(--border-color)';
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {loading ? 'Loading...' : 'Get Results'}
          </button>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px',
            width: '100%'
          }}>
            {results.map(r => (
              <div key={r._id} style={{ 
                marginBottom: 10, 
                background: 'var(--surface)', 
                color: 'var(--text)', 
                borderRadius: 8, 
                boxShadow: '0 1px 4px var(--border-color)', 
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <p style={{ 
                  fontWeight: 600, 
                  color: 'var(--primary)', 
                  fontSize: 'clamp(16px, 3vw, 18px)',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px'
                }}>Student: {r.studentId?.name}</p>
                <ul style={{ 
                  marginLeft: 16,
                  padding: 0,
                  listStylePosition: 'inside' 
                }}>
                  {r.marksObtained.map((m, i) => (
                    <li key={i} style={{ 
                      marginBottom: 8,
                      fontSize: 'clamp(14px, 2vw, 16px)',
                      wordBreak: 'break-word'
                    }}>
                      <span style={{ fontWeight: 500 }}>{m.subjectId?.name || m.subjectId}</span>: {m.marks} 
                      <span style={{ 
                        color: m.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                        marginLeft: '5px',
                        fontWeight: 500
                      }}>({m.status})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExamResultsByExam;
