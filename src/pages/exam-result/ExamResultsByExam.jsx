// ExamResultsByExam.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function ExamResultsByExam() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => setExams(res.data.data || []));
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/admin/examresult/exam/${selectedExam}`, { withCredentials: true });
      setResults(res.data.data || []);
    } catch (err) {
      alert('No results found');
      setResults([]);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>Results by Exam</h2>
          <select onChange={e => setSelectedExam(e.target.value)} value={selectedExam} style={{ padding: 8, borderRadius: 6, width: '100%', marginBottom: 12, border: '1px solid #cbd5e1' }}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
          </select>
          <button onClick={fetchResults} style={{
            marginBottom: 20,
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #cbd5e1',
          }}>Get Results</button>
          {results.map(r => (
            <div key={r._id} style={{ marginBottom: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #cbd5e1', padding: 16 }}>
              <p style={{ fontWeight: 600, color: '#334155' }}>Student: {r.studentId?.name}</p>
              <ul style={{ marginLeft: 16 }}>
                {r.marksObtained.map((m, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{m.subjectId?.name || m.subjectId}: {m.marks} <span style={{ color: m.status === 'Present' ? '#22c55e' : '#ef4444' }}>({m.status})</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ExamResultsByExam;
