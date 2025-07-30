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
      <main className="main-content">
        <Navbar />
        <h2>Results by Exam</h2>
        <select onChange={e => setSelectedExam(e.target.value)} value={selectedExam}>
          <option value="">Select Exam</option>
          {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
        </select>
        <button onClick={fetchResults}>Get Results</button>
        {results.map(r => (
          <div key={r._id}>
            <p>Student: {r.studentId?.name}</p>
            <ul>
              {r.marksObtained.map((m, i) => (
                <li key={i}>{m.subjectId?.name || m.subjectId}: {m.marks} ({m.status})</li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}

export default ExamResultsByExam;
