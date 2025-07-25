// src/pages/TeacherTimetable.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import axios from 'axios';

function TeacherTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherData = JSON.parse(localStorage.getItem('teacherData')) || {};
    const teacherId = teacherData.s_id;

    if (!teacherId) {
      setError('Teacher not logged in.');
      setLoading(false);
      return;
    }

    const fetchTimetable = async () => {
      setError('');
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_URL;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/timetable/teacher/${teacherId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setTimetable(response.data.data);
        } else {
          throw new Error('Failed to fetch timetable');
        }
      } catch (err) {
        setError('Unable to fetch timetable from backend. Using local data.');
        try {
          const localTimetables = JSON.parse(localStorage.getItem('timetables')) || [];
          const mockTimetable = [
            {
              timetableId: 'TT001',
              day: 'Monday',
              period: { periodId: 'P001', timings: '09:00-10:00' },
              mapped: { subject: 'Mathematics', class: 'CS101', classroom: 'Room 101' },
            },
            {
              timetableId: 'TT002',
              day: 'Monday',
              period: { periodId: 'P002', timings: '10:00-11:00' },
              mapped: { subject: 'Physics', class: 'CS101', classroom: 'Room 102' },
            },
          ];
          const filteredTimetable = localTimetables.filter(
            (tt) => tt.mapped?.teacherId === teacherId
          );
          setTimetable(filteredTimetable.length > 0 ? filteredTimetable : mockTimetable);
          if (!localStorage.getItem('timetables')) {
            localStorage.setItem('timetables', JSON.stringify(mockTimetable));
          }
        } catch (localErr) {
          setError('Error accessing local data: ' + localErr.message);
          setTimetable([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : timetable.length === 0 ? (
        <div>No timetable entries found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time Slot</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Classroom</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((entry, index) => (
              <tr key={entry.timetableId || index}>
                <td>{entry.day}</td>
                <td>{entry.period?.timings || 'N/A'}</td>
                <td>{entry.mapped?.subject || 'N/A'}</td>
                <td>{entry.mapped?.class || 'N/A'}</td>
                <td>{entry.mapped?.classroom || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default TeacherTimetable;