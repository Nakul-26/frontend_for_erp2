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
      const mappingRes = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      const pairs = mappingRes.data.data || [];
      // Extract unique subjects and teachers from pairs
      const subjectsMap = {};
      const teachersMap = {};
      pairs.forEach(m => {
        const subj = typeof m.subjectId === 'object' ? m.subjectId : null;
        const teach = typeof m.teacherId === 'object' ? m.teacherId : null;
        if (subj && subj._id) subjectsMap[subj._id] = subj;
        if (teach && teach._id) teachersMap[teach._id] = teach;
      });
      const uniqueSubjects = Object.values(subjectsMap);
      const uniqueTeachers = Object.values(teachersMap);
      console.log('Subjects fetched:', uniqueSubjects);
      console.log('Teachers fetched:', uniqueTeachers);
      console.log('Mapped pairs fetched:', pairs);
      setSubjects(uniqueSubjects);
      setTeachers(uniqueTeachers);
      setMappedPairs(pairs);
      setError('');
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

    // Strict validation: ensure every non-break period has a valid mappedId
    for (const day of days) {
      for (const slot of timeSlots) {
        if (!isBreakPeriod(slot.period)) {
          const cell = grid[day]?.[slot._id] || {};
          if (!cell.combo) {
            setLoading(false);
            setError(`Please select a subject-teacher pair for ${day}, ${slot.period}`);
            return;
          }
          const [subjectId, teacherId] = cell.combo.split('___');
          const found = mappedPairs.find(m => {
            const mSubjectId = typeof m.subjectId === 'object' ? m.subjectId._id : m.subjectId;
            const mTeacherId = typeof m.teacherId === 'object' ? m.teacherId._id : m.teacherId;
            return mSubjectId === subjectId && mTeacherId === teacherId;
          });
          if (!found || !found._id) {
            setLoading(false);
            setError(`Invalid mapping for ${day}, ${slot.period}. Please select a valid subject-teacher pair.`);
            return;
          }
        }
      }
    }

    try {
      // Send a separate request for each day
      for (const day of days) {
        const periods = timeSlots
          .filter(slot => !isBreakPeriod(slot.period))
          .map(slot => {
            const cell = grid[day]?.[slot._id] || {};
            let mappedId = '';
            if (cell.combo) {
              const [subjectId, teacherId] = cell.combo.split('___');
              // Find the mapping _id from mappedPairs
              const found = mappedPairs.find(m => {
                const mSubjectId = typeof m.subjectId === 'object' ? m.subjectId._id : m.subjectId;
                const mTeacherId = typeof m.teacherId === 'object' ? m.teacherId._id : m.teacherId;
                return mSubjectId === subjectId && mTeacherId === teacherId;
              });
              if (found) mappedId = found._id;
            }
            return {
              period: slot._id,
              mapped: mappedId
            };
          });
        const payload = {
          day,
          periods
        };
        console.log('Submitting payload for', day, JSON.stringify(payload, null, 2));
        await axios.post(`${API_BASE_URL}/api/v1/admin/createdailyschedule/${selectedClass}`, payload, { withCredentials: true });
      }
      setSuccess('Timetable created successfully!');
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setError(backendMsg ? `Backend: ${backendMsg}` : 'Failed to create timetable.');
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
                                    value={grid[day]?.[slot._id]?.combo || ''}
                                    onChange={e => {
                                      const comboValue = e.target.value;
                                      if (!comboValue) {
                                        handleGridChange(day, slot._id, 'combo', '');
                                        handleGridChange(day, slot._id, 'subject', '');
                                        handleGridChange(day, slot._id, 'teacher', '');
                                        return;
                                      }
                                      const [subjectId, teacherId] = comboValue.split('___');
                                      handleGridChange(day, slot._id, 'combo', comboValue);
                                      handleGridChange(day, slot._id, 'subject', subjectId);
                                      handleGridChange(day, slot._id, 'teacher', teacherId);
                                    }}
                                  >
                                    <option value="">-- Subject & Teacher --</option>
                                    {mappedPairs.map(m => {
                                      const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                                      const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                                      const subjectId = mSubject ? mSubject._id : m.subjectId;
                                      const teacherId = mTeacher ? mTeacher._id : m.teacherId;
                                      const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || subjectId) : subjectId;
                                      const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || teacherId) : teacherId;
                                      return (
                                        <option key={subjectId + '___' + teacherId} value={subjectId + '___' + teacherId}>
                                          {subjectName} - {teacherName}
                                        </option>
                                      );
                                    })}
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
