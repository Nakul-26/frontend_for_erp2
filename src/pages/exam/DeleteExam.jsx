import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function DeleteExam() {
  const [examId, setExamId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/exam/${examId}`, { withCredentials: true });
      setMessage('Exam deleted!');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar pageTitle={"Delete Exam"} />
        <div className="timetable-form-container">
          {/* <h2>Delete Exam</h2> */}
          <form onSubmit={handleDelete} style={{ marginBottom: 24 }}>
            <input type="text" value={examId} onChange={e => setExamId(e.target.value)} placeholder="Enter Exam ID" required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
            <button type="submit" style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
          </form>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </main>
    </div>
  );
}

export default DeleteExam;
