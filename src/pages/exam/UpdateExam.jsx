import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function UpdateExam() {
  const params = useParams();
  const [examId, setExamId] = useState(params.examId || '');
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // On mount or when params.examId changes, update examId and fetch exam if present
  useEffect(() => {
    if (params.examId) {
      setExamId(params.examId);
      fetchExam(params.examId);
    }
  }, [params.examId]);

  // If examId is cleared, clear exam details
  useEffect(() => {
    if (!examId) {
      setExam(null);
    }
  }, [examId]);

  const fetchExam = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/exam/${id}`, { withCredentials: true });
      setExam(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Not found');
      setExam(null);
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    if (examId) fetchExam(examId);
  };

  // Subject editing helpers
  const handleSubjectChange = (idx, field, value) => {
    const updated = exam.subjects.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setExam({ ...exam, subjects: updated });
  };

  const addSubject = () => {
    setExam({ ...exam, subjects: [...(exam.subjects || []), { subjectId: '', maxMarks: 100 }] });
  };

  const removeSubject = (idx) => {
    setExam({ ...exam, subjects: exam.subjects.filter((_, i) => i !== idx) });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        examName: exam.examName,
        examDate: exam.examDate,
        subjects: exam.subjects.map(s => ({
          subjectId: typeof s.subjectId === 'object' ? s.subjectId._id : s.subjectId,
          maxMarks: s.maxMarks
        }))
      };
      await axios.put(`${API_BASE_URL}/api/v1/admin/exam/${examId}`, payload, { withCredentials: true });
      setSuccess('Exam updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="timetable-form-container">
          <h2>Update Exam</h2>
          <form onSubmit={handleFetch} style={{ marginBottom: 24 }}>
            <input type="text" value={examId} onChange={e => setExamId(e.target.value)} placeholder="Enter Exam ID" required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Fetch</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          {exam && (
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, marginRight: 8 }}>Exam Name:</label>
                <input type="text" value={exam.examName} onChange={e => setExam({ ...exam, examName: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, marginRight: 8 }}>Exam Date:</label>
                <input type="date" value={exam.examDate?.slice(0,10) || ''} onChange={e => setExam({ ...exam, examDate: e.target.value })} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <h3 style={{ marginTop: 24 }}>Subjects:</h3>
              {(exam.subjects || []).map((sub, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <input type="text" value={typeof sub.subjectId === 'object' ? sub.subjectId.name : sub.subjectId} onChange={e => handleSubjectChange(idx, 'subjectId', e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8, minWidth: 120 }} placeholder="Subject ID or Name" />
                  <input type="number" value={sub.maxMarks} min={1} onChange={e => handleSubjectChange(idx, 'maxMarks', e.target.value)} required style={{ width: 100, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
                  <button type="button" onClick={() => removeSubject(idx)} style={{ color: 'red', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addSubject} style={{ marginTop: 8, marginBottom: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Add Subject</button>
              <br />
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Update Exam</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default UpdateExam;
