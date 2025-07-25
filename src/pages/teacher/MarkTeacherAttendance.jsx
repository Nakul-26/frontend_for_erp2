import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';

function MarkTeacherAttendance() {
  const [classId, setClassId] = useState('');
  const [timetableId, setTimetableId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!classId || !timetableId) return;

    const fetchTeachers = async () => {
      setError('');
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/teachers/class/${classId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const fetchedTeachers = response.data.data;
          setTeachers(fetchedTeachers);
          setAttendanceData(fetchedTeachers.map((teacher) => ({
            teacherId: teacher.s_id,
            status: 'present',
            remarks: '',
          })));
        } else {
          throw new Error('Failed to fetch teachers');
        }
      } catch (err) {
        setError('Unable to fetch teachers from backend. Using local data.');
        try {
          const localTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
          const filteredTeachers = localTeachers.filter((teacher) =>
            teacher.classes?.includes(classId)
          );
          setTeachers(filteredTeachers);
          setAttendanceData(filteredTeachers.map((teacher) => ({
            teacherId: teacher.s_id,
            status: 'present',
            remarks: '',
          })));
        } catch (localErr) {
          setError('Error accessing local data: ' + localErr.message);
          setTeachers([]);
          setAttendanceData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [classId, timetableId]);

  const handleAttendanceChange = (index, field, value) => {
    const updatedData = [...attendanceData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setAttendanceData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const attendanceRecords = attendanceData.map((record) => ({
      type: 'teacher',
      attendanceId: `${timetableId}_${record.teacherId}_${date}`,
      date,
      timetableId,
      status: record.status,
      remarks: record.remarks || undefined,
    }));

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/attendance/mark`,
        { attendances: attendanceRecords },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Teacher attendance marked successfully');
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (err) {
      setError('Unable to mark attendance via backend. Saving to local data.');
      try {
        const localAttendances = JSON.parse(localStorage.getItem('attendances')) || [];
        localAttendances.push(...attendanceRecords);
        localStorage.setItem('attendances', JSON.stringify(localAttendances));
        setSuccess('Teacher attendance marked in local data!');
        setError('');
      } catch (localErr) {
        setError('Error saving to local data: ' + localErr.message);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar role="admin" />
        <h2>Mark Teacher Attendance</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px' }}>Class ID:</label>
            <input
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="e.g., CS101"
              required
              style={{ padding: '5px', marginRight: '20px' }}
            />
            <label style={{ marginRight: '10px' }}>Timetable ID:</label>
            <input
              type="text"
              value={timetableId}
              onChange={(e) => setTimetableId(e.target.value)}
              placeholder="e.g., TT001"
              required
              style={{ padding: '5px', marginRight: '20px' }}
            />
            <label style={{ marginRight: '10px' }}>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ padding: '5px' }}
            />
          </div>
          {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
          ) : teachers.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
              No teachers found for this class.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, index) => (
                  <tr key={teacher.s_id}>
                    <td>{teacher.s_id}</td>
                    <td>{teacher.name}</td>
                    <td>
                      <select
                        value={attendanceData[index]?.status || 'present'}
                        onChange={(e) => handleAttendanceChange(index, 'status', e.target.value)}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={attendanceData[index]?.remarks || ''}
                        onChange={(e) => handleAttendanceChange(index, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button type="submit" className="login-button" style={{ marginTop: '20px' }}>
            Mark Attendance
          </button>
        </form>
      </main>
    </div>
  );
}

export default MarkTeacherAttendance;