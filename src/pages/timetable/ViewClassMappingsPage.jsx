import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function ViewClassMappingsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      console.log('Classes fetched:', res);
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
    }
  };

  const fetchMappings = async (classId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      console.log('Mappings fetched:', res);
      setMappings(res.data.data?.data || []);
    } catch (err) {
      setError('Failed to fetch mappings.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setMappings([]);
    if (classId) {
      fetchMappings(classId);
    }
  };

  const handleDelete = async (mappingId) => {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/deletemapped/${mappingId}`, { withCredentials: true });
      setSuccess('Mapping deleted successfully.');
      setMappings(mappings.filter(m => m._id !== mappingId));
    } catch (err) {
      setError('Failed to delete mapping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="timetable-form-container">
          <h1>View Class Mappings</h1>
          {loading && <p className="status-message">Loading...</p>}
          {error && <p className="status-message error">{error}</p>}
          {success && <p className="status-message success">{success}</p>}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="class-select">Select Class: </label>
            <select id="class-select" value={selectedClass} onChange={handleClassChange} required>
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
              ))}
            </select>
          </div>
          {selectedClass && mappings.length > 0 && (
            <table className="timetable-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map(mapping => (
                  <tr key={mapping._id}>
                    <td>{mapping.subjectName || mapping.subject?.name || mapping.subjectId}</td>
                    <td>{mapping.teacherName || mapping.teacher?.name || mapping.teacherId}</td>
                    <td>
                      <button onClick={() => handleDelete(mapping._id)} disabled={loading} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selectedClass && mappings.length === 0 && !loading && (
            <p>No mappings found for this class.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default ViewClassMappingsPage;
