import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function CreateTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [timeSlots, setTimeSlots] = useState([]);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log('useEffect: fetching classes and time slots');
    fetchClasses();
    fetchTimeSlots();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      console.log('Classes API response:', res.data);
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
      console.error('Error fetching classes:', err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallslots`, { withCredentials: true });
      console.log('TimeSlots API response:', res.data);
      setTimeSlots(res.data || []);
      console.log('Time slots fetched:', res.data);
    } catch (err) {
      setError('Failed to fetch time slots.');
      console.error('Error fetching time slots:', err);
    }
  };

  const fetchSubjectsAndTeachers = async (classId) => {
    try {
      const [subRes, teacherRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/admin/getallsubjectformapped?classId=${classId}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/admin/getallteacherformapped?classId=${classId}`, { withCredentials: true })
      ]);
      console.log('Subjects API response:', subRes.data);
      console.log('Teachers API response:', teacherRes.data);
      // Deduplicate teachers by _id
      const uniqueTeachers = (teacherRes.data.data || []).filter((teacher, idx, arr) =>
        arr.findIndex(t => t._id === teacher._id) === idx
      );
      setSubjects(subRes.data.data || []);
      setTeachers(uniqueTeachers);
    } catch (err) {
      setError('Failed to fetch subjects or teachers.');
      console.error('Error fetching subjects or teachers:', err);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    console.log('Class selected:', classId);
    setSelectedClass(classId);
    setGrid({});
    // Do NOT reset timeSlots here!
    if (classId) {
      await fetchSubjectsAndTeachers(classId);
    }
  };

  const handleGridChange = (day, slotId, field, value) => {
    setGrid(prev => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [slotId]: {
            ...((prev[day] && prev[day][slotId]) || {}),
            [field]: value
          }
        }
      };
      console.log('Grid updated:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('Submitting timetable:', { classId: selectedClass, timetable: grid });
    try {
      await axios.post(`${API_BASE_URL}/api/v1/admin/timetable`, {
        classId: selectedClass,
        timetable: grid
      }, { withCredentials: true });
      setSuccess('Timetable created successfully!');
    } catch (err) {
      setError('Failed to create timetable.');
      console.error('Error submitting timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debug rendering
  console.log('Rendering: selectedClass', selectedClass, 'timeSlots', timeSlots, 'subjects', subjects, 'teachers', teachers, 'grid', grid);
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="timetable-form-container">
          <h1>Create Timetable</h1>
          <form onSubmit={handleSubmit}>
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

            {selectedClass && timeSlots.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="timetable-table">
                  <thead>
                    <tr>
                      <th>Day / Time Slot</th>
                      {timeSlots.map(slot => (
                        <th key={slot._id}>
                          {slot.period}<br />
                          <small>{slot.startTime} - {slot.endTime}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day}>
                        <td>{day}</td>
                        {timeSlots.map(slot => (
                        <td key={slot._id}>
                          <div>
                            <select
                              value={grid[day]?.[slot._id]?.subject || ''}
                              onChange={e => handleGridChange(day, slot._id, 'subject', e.target.value)}
                            >
                              <option value="">-- Subject --</option>
                              {subjects.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <select
                              value={grid[day]?.[slot._id]?.teacher || ''}
                              onChange={e => handleGridChange(day, slot._id, 'teacher', e.target.value)}
                            >
                              <option value="">-- Teacher --</option>
                              {(() => {
                                // Only show teachers mapped to the selected subject for this slot
                                const selectedSubjectId = grid[day]?.[slot._id]?.subject;
                                let filteredTeachers = teachers;
                                if (selectedSubjectId) {
                                  filteredTeachers = teachers.filter(t => {
                                    // If teacher.subjects is an array of subject ids or objects
                                    if (Array.isArray(t.subjects)) {
                                      return t.subjects.includes(selectedSubjectId) || t.subjects.some(s => (s._id || s) === selectedSubjectId);
                                    }
                                    return true;
                                  });
                                }
                                return filteredTeachers.map(teacher => (
                                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                ));
                              })()}
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

            <button type="submit" disabled={!selectedClass || loading}>
              Create Timetable
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateTimetablePage;
