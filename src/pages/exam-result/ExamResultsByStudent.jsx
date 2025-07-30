// ExamResultsByStudent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function ExamResultsByStudent() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/student/all`, { withCredentials: true })
      .then(res => setStudents(res.data.data || []));
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/admin/examresult/student/${selectedStudent}`, { withCredentials: true });
      setResults(res.data.data || []);
    } catch (err) {
      setResults([]);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <h2>Results by Student</h2>
        <select onChange={e => setSelectedStudent(e.target.value)} value={selectedStudent}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <button onClick={fetchResults}>Get Results</button>
        {results.map(r => (
          <div key={r._id} style={{ marginBottom: 16 }}>
            <p>Exam: {r.examId?.examName}</p>
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

export default ExamResultsByStudent;
