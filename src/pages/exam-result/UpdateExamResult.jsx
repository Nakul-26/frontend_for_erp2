import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function UpdateExamResult() {
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [resultData, setResultData] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  // Fetch all exam results (basic info for selection)
  useEffect(() => {
    axios.get(`${API}/api/v1/admin/examresult/all`, { withCredentials: true })
      .then(res => setResults(res.data.data || []))
      .catch(() => setResults([]));
  }, []);

  const handleResultSelect = async (e) => {
    const id = e.target.value;
    setSelectedResultId(id);
    try {
      const res = await axios.get(`${API}/api/v1/admin/examresult/${id}`, { withCredentials: true });
      const result = res.data.data.find(r => r._id === id);
      setResultData(result);
    } catch (error) {
      alert('Error fetching result data');
    }
  };

  const handleMarksChange = (index, field, value) => {
    const updated = [...resultData.marksObtained];
    updated[index][field] = field === 'marks' ? Number(value) : value;
    setResultData({ ...resultData, marksObtained: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/api/v1/admin/examresult/${selectedResultId}`, resultData, { withCredentials: true });
      alert('Exam result updated!');
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="form-container">
          <h2>Update Exam Result</h2>

          <div style={{ marginBottom: 16 }}>
            <label>Select Exam Result to Update:</label>
            <select value={selectedResultId} onChange={handleResultSelect} required style={{ padding: 8, borderRadius: 6 }}>
              <option value="">Select</option>
              {results.map(r => (
                <option key={r._id} value={r._id}>
                  {`Result for ${r.studentId?.name || r.studentId} in ${r.examId?.examName || r.examId}`}
                </option>
              ))}
            </select>
          </div>

          {resultData && (
            <form onSubmit={handleSubmit}>
              <h4>Student: {resultData.studentId?.name || resultData.studentId}</h4>
              <h4>Exam: {resultData.examId?.examName || resultData.examId}</h4>

              {resultData.marksObtained.map((m, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <label>
                    {m.subjectId?.name || m.subjectId}:
                    <input
                      type="number"
                      min={0}
                      value={m.marks}
                      onChange={(e) => handleMarksChange(i, 'marks', e.target.value)}
                      style={{ marginLeft: 8, width: 80, padding: 6 }}
                    />
                    <select
                      value={m.status}
                      onChange={(e) => handleMarksChange(i, 'status', e.target.value)}
                      style={{ marginLeft: 8, padding: 6 }}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </label>
                </div>
              ))}

              <button
                type="submit"
                style={{
                  marginTop: 12,
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Update Result
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default UpdateExamResult;
