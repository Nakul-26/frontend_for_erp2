import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';

function GetTeacherAttendance() {
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState('present');
  const [editRemarks, setEditRemarks] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // Handler for delete
  const handleDeleteAttendance = async (recordId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${recordId}`,
        { withCredentials: true }
      );
      console.log('Delete response:', response);
      if (response.status == 200) {
        setAttendanceRecords(attendanceRecords.filter((r) => r._id !== recordId));
        setSuccess('Attendance record deleted successfully');
      } else {
        setError('Failed to delete attendance record');
      }
    } catch (err) {
      setError('Unable to delete attendance record.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for update
  const handleEditClick = (record) => {
    setEditRecordId(record._id);
    setEditStatus(record.status);
    setEditRemarks(record.remarks);
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${editRecordId}`,
        {
          status: editStatus,
          remarks: editRemarks,
        },
        { withCredentials: true }
      );
      console.log('Update response:', response.status);
      if (response.status == 200) {
        setSuccess('Attendance updated successfully');
        setAttendanceRecords(attendanceRecords.map((r) =>
          r._id === editRecordId ? { ...r, status: editStatus, remarks: editRemarks } : r
        ));
        setEditRecordId(null);
      } else {
        setError('Failed to update attendance');
      }
    } catch (err) {
      setError('Unable to update attendance.');
    } finally {
      setLoading(false);
    }
  };
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
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

  const handleTeacherChange = (e) => {
    setSelectedTeacherId(e.target.value);
  };

  const handleFetchAttendance = async () => {
    if (!selectedTeacherId) {
      setError('Please select a teacher.');
      return;
    }
    setError('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/teacher-attendance/${selectedTeacherId}`,
        { withCredentials: true }
      );

      console.log('Attendance response:', response);
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ fontSize: '18px' }}>
        <Navbar role="admin" />
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef' }}>
          <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 700 }}>View Teacher Attendance</h2>
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
            <button
              type="button"
              className="login-button"
              style={{ marginLeft: '10px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
              onClick={handleFetchAttendance}
              disabled={!selectedTeacherId}
            >
              Get Attendance
            </button>
          </div>
          {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
              {success}
            </div>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
          ) : attendanceRecords.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
              No attendance records found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#e0e7ef' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Date</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Status</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Remarks</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #cbd5e1' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e0e7ef' }}>{new Date(record.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e0e7ef' }}>
                      {editRecordId === record._id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="leave">Leave</option>
                        </select>
                      ) : (
                        record.status
                      )}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e0e7ef' }}>
                      {editRecordId === record._id ? (
                        <input
                          type="text"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', width: '150px' }}
                          placeholder="Optional remarks"
                        />
                      ) : (
                        record.remarks
                      )}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #e0e7ef' }}>
                      {editRecordId === record._id ? (
                        <>
                          <button
                            type="button"
                            className="login-button"
                            style={{ marginRight: '5px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
                            onClick={handleUpdateAttendance}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="login-button"
                            style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
                            onClick={() => setEditRecordId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="login-button"
                            style={{ marginRight: '5px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
                            onClick={() => handleEditClick(record)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="login-button"
                            style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #cbd5e1' }}
                            onClick={() => handleDeleteAttendance(record._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherAttendance;
