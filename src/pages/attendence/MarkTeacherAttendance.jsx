import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
          
          // Initialize attendance data for all teachers
          const initialAttendanceData = fetchedTeachers.map(teacher => ({
            teacherId: teacher._id,
            status: 'present',
            remarks: ''
          }));
          setAttendanceData(initialAttendanceData);
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

  const handleAttendanceChange = (teacherId, field, value) => {
    const updatedData = attendanceData.map(item => {
      if (item.teacherId === teacherId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setAttendanceData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (attendanceData.length === 0) {
      setError('No teachers available for marking attendance.');
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
      // Create a counter for successful submissions
      let successCount = 0;
      
      // Submit attendance for each teacher one by one
      for (const record of attendanceRecords) {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/admin/teacher-attendance`,
          record,
          { withCredentials: true }
        );
        
        if (response.data.status == "201") {
          successCount++;
        }
      }
      
      if (successCount === attendanceRecords.length) {
        setSuccess('Attendance marked successfully for all teachers');
      } else if (successCount > 0) {
        setSuccess(`Attendance marked for ${successCount} out of ${attendanceRecords.length} teachers`);
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
        <Navbar pageTitle={"Mark Teacher Attendance"} role="admin" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <Link to="/admin/teacher-attendance" style={{ 
            textDecoration: 'none', 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}>
            View/Update Attendance
          </Link>
        </div>
        <div className="form-container" style={{ width: '100%', maxWidth: '100%', margin: 0, background: 'var(--surface)', padding: 32, borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {/* <h2 style={{ marginBottom: 24, color: 'var(--primary)', fontWeight: 700 }}>Mark Teacher Attendance</h2> */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '10px', fontWeight: 600, color: 'var(--text)' }}>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ 
                  padding: '10px', 
                  borderRadius: 6, 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--input-background)', 
                  color: 'var(--input-text)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  outline: 'none'
                }}
              />
            </div>
            {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '20px' }}>{success}</div>}
            {loading ? (
              <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>Loading...</div>
            ) : teachers.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>
                No teachers found.
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary)', fontWeight: 600, fontSize: '20px' }}>Mark Attendance for All Teachers</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr',
                  gap: '16px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}>
                  {teachers.map((teacher, index) => {
                    const teacherAttendance = attendanceData.find(a => a.teacherId === teacher._id) || {};
                    
                    return (
                      <div key={teacher._id} style={{ 
                        padding: '16px',
                        borderRadius: '8px',
                        background: 'var(--surface)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '10px',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                          {teacher.name} ({teacher.s_id})
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px', fontWeight: 500, color: 'var(--text)' }}>Status:</label>
                          <select
                            value={teacherAttendance.status || 'present'}
                            onChange={(e) => handleAttendanceChange(teacher._id, 'status', e.target.value)}
                            style={{ 
                              padding: '10px', 
                              borderRadius: 6, 
                              border: '1px solid var(--border-color)', 
                              minWidth: 120, 
                              background: 'var(--input-background)', 
                              color: 'var(--input-text)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            <option value="present" style={{ background: 'var(--input-background)', color: '#4CAF50' }}>Present</option>
                            <option value="absent" style={{ background: 'var(--input-background)', color: '#F44336' }}>Absent</option>
                            <option value="leave" style={{ background: 'var(--input-background)', color: '#FF9800' }}>Leave</option>
                          </select>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <label style={{ marginRight: '10px', fontWeight: 500, color: 'var(--text)' }}>Remarks:</label>
                          <input
                            type="text"
                            value={teacherAttendance.remarks || ''}
                            onChange={(e) => handleAttendanceChange(teacher._id, 'remarks', e.target.value)}
                            placeholder="Optional remarks"
                            style={{ 
                              padding: '10px', 
                              borderRadius: 6, 
                              border: '1px solid var(--border-color)', 
                              width: '100%', 
                              background: 'var(--input-background)', 
                              color: 'var(--input-text)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="login-button"
              style={{ 
                marginTop: '20px', 
                padding: '12px 24px', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                fontWeight: 600, 
                cursor: 'pointer', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
              disabled={teachers.length === 0}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Mark Attendance for All
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default MarkTeacherAttendance;