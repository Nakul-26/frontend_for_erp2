// src/pages/attendence/MarkStudentAttendance_new.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function MarkStudentAttendance() {
  const [classId, setClassId] = useState('');
  const [timetableId, setTimetableId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminData } = useAuth();

  useEffect(() => {
    if (!classId || !timetableId) return;

    const fetchStudents = async () => {
      setError('');
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_URL;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin/students/class/${classId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const fetchedStudents = response.data.data;
          setStudents(fetchedStudents);
          setAttendanceData(fetchedStudents.map((student) => ({
            studentId: student.s_id,
            status: 'present',
            remarks: '',
          })));
        } else {
          throw new Error('Failed to fetch students');
        }
      } catch (err) {
        setError('Unable to fetch students from backend.');
        setStudents([]);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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
      type: 'student',
      attendanceId: `${timetableId}_${record.studentId}_${date}`,
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
        setSuccess('Student attendance marked successfully');
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (err) {
      setError('Unable to mark attendance via backend.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"Mark Student Attendance"} role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <Link to="/admin/student-attendance" style={{ 
            padding: '8px 16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            View/Update Attendance
          </Link>
        </div>
        
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
          ) : students.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
              No students found for this class.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.s_id}>
                    <td>{student.s_id}</td>
                    <td>{student.name}</td>
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

export default MarkStudentAttendance;
