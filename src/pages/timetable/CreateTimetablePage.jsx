import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function CreateTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [periods, setPeriods] = useState(['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6']);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/admin/classes`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/admin/subjects`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/admin/teachers`, { withCredentials: true })
      ]);
      setClasses(classRes.data.data || []);
      setSubjects(subjectRes.data.data || []);
      setTeachers(teacherRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch initial data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setGrid({}); // Reset grid when class changes
  };

  const handleGridChange = (day, period, field, value) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...((prev[day] && prev[day][period]) || {}),
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_BASE_URL}/api/v1/admin/timetable`, {
        classId: selectedClass,
        timetable: grid
      }, { withCredentials: true });
      setSuccess('Timetable created successfully!');
    } catch (err) {
      setError('Failed to create timetable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <header className="dashboard-header">
          <h1>Create Timetable</h1>
        </header>
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="class-select">Select Class: </label>
            <select id="class-select" value={selectedClass} onChange={handleClassChange} required>
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls._id || cls.id} value={cls._id || cls.id}>{cls.name || cls.className}</option>
              ))}
            </select>
          </div>
          {selectedClass && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Day / Period</th>
                    {periods.map(period => (
                      <th key={period}>{period}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day}>
                      <td>{day}</td>
                      {periods.map(period => (
                        <td key={period} style={{ minWidth: 180 }}>
                          <div>
                            <select
                              value={grid[day]?.[period]?.subject || ''}
                              onChange={e => handleGridChange(day, period, 'subject', e.target.value)}
                              required
                            >
                              <option value="">-- Subject --</option>
                              {subjects.map(sub => (
                                <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <select
                              value={grid[day]?.[period]?.teacher || ''}
                              onChange={e => handleGridChange(day, period, 'teacher', e.target.value)}
                              required
                            >
                              <option value="">-- Teacher --</option>
                              {teachers.map(teacher => (
                                <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>{teacher.name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="submit" style={{ marginTop: '20px' }} disabled={!selectedClass || loading}>Create Timetable</button>
        </form>
      </main>
    </div>
  );
}

export default CreateTimetablePage;
