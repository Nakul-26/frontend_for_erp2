import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';

function CreateTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappedPairs, setMappedPairs] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [timeSlots, setTimeSlots] = useState([]);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
    fetchTimeSlots();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      setClasses(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch classes.');
      console.error(err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallslots`, { withCredentials: true });
      setTimeSlots(res.data || []);
    } catch (err) {
      setError('Failed to fetch time slots.');
      console.error(err);
    }
  };

  const fetchSubjectsAndTeachers = async (classId) => {
    try {
      const [subRes, teacherRes, mappingRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/admin/getallsubjectformapped?classId=${classId}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/admin/getallteacherformapped?classId=${classId}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings?classId=${classId}`, { withCredentials: true })
      ]);

      const uniqueTeachers = (teacherRes.data.data || []).filter((teacher, idx, arr) =>
        arr.findIndex(t => t._id === teacher._id) === idx
      );

      setSubjects(subRes.data.data || []);
      setTeachers(uniqueTeachers);
      setMappedPairs(mappingRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch subjects, teachers, or mappings.');
      console.error(err);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setGrid({});
    if (classId) {
      await fetchSubjectsAndTeachers(classId);
    }
  };

  const handleGridChange = (day, slotId, field, value) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: {
          ...((prev[day] && prev[day][slotId]) || {}),
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

    // Validation: ensure both subject and teacher are selected for each non-break slot
    for (const day of days) {
      for (const slot of timeSlots) {
        if (!isBreakPeriod(slot.period)) {
          const cell = grid[day]?.[slot._id] || {};
          if (!cell.subject || !cell.teacher) {
            setLoading(false);
            setError(`Please select both subject and teacher for ${day}, ${slot.period}`);
            return;
          }
        }
      }
    }

    try {
      await axios.post(`${API_BASE_URL}/api/v1/admin/timetable`, {
        classId: selectedClass,
        timetable: grid
      }, { withCredentials: true });

      setSuccess('Timetable created successfully!');
    } catch (err) {
      setError('Failed to create timetable.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isBreakPeriod = (periodName) => periodName.toLowerCase().includes('break');

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
                            {isBreakPeriod(slot.period) ? (
                              <em>{slot.period}</em>
                            ) : (
                              <>
                                <div>
                                  <select
                                    value={grid[day]?.[slot._id]?.subject || ''}
                                    onChange={e => handleGridChange(day, slot._id, 'subject', e.target.value)}
                                  >
                                    <option value="">-- Subject --</option>
                                    {(() => {
                                      const selectedTeacherId = grid[day]?.[slot._id]?.teacher;
                                      let filteredSubjects = subjects;
                                      if (selectedTeacherId && mappedPairs.length > 0) {
                                        filteredSubjects = subjects.filter(s =>
                                          mappedPairs.some(m =>
                                            m.teacherId === selectedTeacherId && m.subjectId === s._id
                                          )
                                        );
                                      }
                                      return filteredSubjects.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                      ));
                                    })()}
                                  </select>
                                </div>
                                <div style={{ marginTop: 4 }}>
                                  <select
                                    value={grid[day]?.[slot._id]?.teacher || ''}
                                    onChange={e => handleGridChange(day, slot._id, 'teacher', e.target.value)}
                                  >
                                    <option value="">-- Teacher --</option>
                                    {(() => {
                                      const selectedSubjectId = grid[day]?.[slot._id]?.subject;
                                      let filteredTeachers = teachers;
                                      if (selectedSubjectId && mappedPairs.length > 0) {
                                        filteredTeachers = teachers.filter(t =>
                                          mappedPairs.some(m =>
                                            m.subjectId === selectedSubjectId && m.teacherId === t._id
                                          )
                                        );
                                      }
                                      return filteredTeachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                      ));
                                    })()}
                                  </select>
                                </div>
                              </>
                            )}
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
