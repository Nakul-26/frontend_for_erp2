import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';

function UpdateTeacherAttendance() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [status, setStatus] = useState('present');
  const [remarks, setRemarks] = useState('');
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
          setTeachers(response.data.data);
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

  const handleTeacherChange = async (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);
    setAttendanceRecords([]);
    setSelectedRecordId('');
    setStatus('present');
    setRemarks('');
    if (!teacherId) return;
    setLoading(true);
    setError('');
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${teacherId}`,
        { withCredentials: true }
      );
      if (response.data.status === 200) {
        setAttendanceRecords(response.data.data);
      } else {
        setAttendanceRecords([]);
        setError('No attendance records found for this teacher.');
      }
    } catch (err) {
      setError('Unable to fetch attendance records.');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordChange = (e) => {
    const recordId = e.target.value;
    setSelectedRecordId(recordId);
    const record = attendanceRecords.find((r) => r._id === recordId);
    if (record) {
      setStatus(record.status);
      setRemarks(record.remarks);
    } else {
      setStatus('present');
      setRemarks('');
    }
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedTeacherId || !selectedRecordId) {
      setError('Please select a teacher and attendance record.');
      return;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${selectedRecordId}`,
        {
          status,
          remarks,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccess('Attendance updated successfully');
      } else {
        setError('Failed to update attendance');
      }
    } catch (err) {
      setError('Unable to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar role="admin" />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>Update Teacher Attendance</h2>
          <form onSubmit={handleUpdateAttendance}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 500 }}>Select Teacher:</label>
              <select
                value={selectedTeacherId}
                onChange={handleTeacherChange}
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
              <label style={{ marginRight: '10px', fontWeight: 500 }}>Select Attendance Record:</label>
              <select
                value={selectedRecordId}
                onChange={handleRecordChange}
                required
                style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginRight: '20px', minWidth: 180 }}
                disabled={attendanceRecords.length === 0}
              >
                <option value="">Select Record</option>
                {attendanceRecords.map((record) => (
                  <option key={record._id} value={record._id}>
                    {new Date(record.date).toLocaleDateString()} - {record.status}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px', fontWeight: 500 }}>Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginRight: '20px', minWidth: 120 }}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
              <label style={{ marginRight: '10px', fontWeight: 500 }}>Remarks:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
                style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', width: '200px' }}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}
            <button
              type="submit"
              className="login-button"
              style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
              disabled={!selectedTeacherId || !selectedRecordId}
            >
              Update Attendance
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default UpdateTeacherAttendance;
