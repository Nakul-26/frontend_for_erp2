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

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => {
        setExams(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <div style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '0px 0px 0px 0px' }}>
          <div className="timetable-form-container">
            {/* <h2>All Exams</h2> */}
            {message && <p style={{ color: 'green', marginBottom: 8 }}>{message}</p>}
            {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
            {loading ? <p>Loading...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Exam Name</th>
                    <th>Class</th>
                    <th>Date</th>
                    <th>Subjects</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => (
                    <tr key={exam._id}>
                      <td>{exam.examName}</td>
                      <td>{exam.classId?.name || '-'}</td>
                      <td>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}</td>
                      <td>{exam.subjects?.map(s => s.subjectId?.name).join(', ')}</td>
                      <td>
                        <button onClick={() => handleModify(exam._id)} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Modify</button>
                        <button onClick={() => handleDelete(exam._id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }} disabled={deletingId === exam._id}>{deletingId === exam._id ? 'Deleting...' : 'Delete'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GetAllExams;
