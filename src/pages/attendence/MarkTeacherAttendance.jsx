import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';

function MarkTeacherAttendance() {
  // Removed timetableId state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setError('');
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/getallteacher`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const fetchedTeachers = response.data.data;
          setTeachers(fetchedTeachers);
        } else {
          throw new Error('Failed to fetch teachers');
        }
      } catch (err) {
        setError('Unable to fetch teachers.');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleAttendanceChange = (index, field, value) => {
    if (field === 'teacherId') {
      // When teacher is selected, set attendanceData for that teacher
      setAttendanceData([{ teacherId: value, status: attendanceData[0]?.status || 'present', remarks: attendanceData[0]?.remarks || '' }]);
    } else {
      const updatedData = [...attendanceData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      setAttendanceData(updatedData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!attendanceData[0]?.teacherId) {
      setError('Please select a teacher before submitting.');
      return;
    }
    const attendanceRecords = attendanceData.map((record) => ({
      teacherId: record.teacherId,
      date,
      status: record.status,
      remarks: record.remarks || '',
    }));

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      console.log('Submitting attendance records:', attendanceRecords);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance`,
        attendanceRecords[0],
        { withCredentials: true }
      );

      console.log('Attendance response:', response.data);
      console.log('Attendance response:', response.data.status);

      if (response.data.status == "201") {
        setSuccess('Teacher attendance marked successfully');
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (err) {
      setError('Unable to mark attendance. error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar role="admin" />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>Mark Teacher Attendance</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 500 }}>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}
            {loading ? (
              <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
            ) : teachers.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
                No teachers found.
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 500 }}>Select Teacher:</label>
                <select
                  value={attendanceData[0]?.teacherId || ''}
                  onChange={(e) => handleAttendanceChange(0, 'teacherId', e.target.value)}
                  required
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginRight: '20px', minWidth: 180 }}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.s_id})
                    </option>
                  ))}
                </select>
                <label style={{ marginRight: '10px', fontWeight: 500 }}>Status:</label>
                <select
                  value={attendanceData[0]?.status || 'present'}
                  onChange={(e) => handleAttendanceChange(0, 'status', e.target.value)}
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginRight: '20px', minWidth: 120 }}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
                <label style={{ marginRight: '10px', fontWeight: 500 }}>Remarks:</label>
                <input
                  type="text"
                  value={attendanceData[0]?.remarks || ''}
                  onChange={(e) => handleAttendanceChange(0, 'remarks', e.target.value)}
                  placeholder="Optional remarks"
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', width: '200px' }}
                />
              </div>
            )}
            <button
              type="submit"
              className="login-button"
              style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
              disabled={!attendanceData[0]?.teacherId || attendanceData[0]?.teacherId === ''}
            >
              Mark Attendance
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default MarkTeacherAttendance;