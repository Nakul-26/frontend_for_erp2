import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function GetSingleExam() {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setExam(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/exam/${examId}`, { withCredentials: true });
      setExam(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Not found');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar pageTitle={"Get Single Exam"} />
        <div className="timetable-form-container">
          {/* <h2>Get Single Exam</h2> */}
          <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
            <input type="text" value={examId} onChange={e => setExamId(e.target.value)} placeholder="Enter Exam ID" required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Search</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {exam && (
            <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              <p><b>Exam Name:</b> {exam.examName}</p>
              <p><b>Class:</b> {exam.classId?.name}</p>
              <p><b>Date:</b> {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}</p>
              <p><b>Subjects:</b> {exam.subjects?.map(s => s.subjectId?.name).join(', ')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetSingleExam;
