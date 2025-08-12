import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
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
      // console.log('Delete response:', response);
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
      // console.log('Update response:', response.status);
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

  const handleExportToExcel = () => {
    // Get the selected teacher's name and details
    const selectedTeacher = teachers.find(t => t._id === selectedTeacherId);
    const teacherName = selectedTeacher ? selectedTeacher.name : 'Teacher';
    
    // Get current date for the report header
    const reportDate = new Date().toLocaleDateString();

    // Sort records by date in descending order
    const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Prepare CSV rows with teacher information header
    const csvRows = [];
    
    // Add report title and date
    csvRows.push(`Teacher Attendance Report,Generated on: ${reportDate}`);
    csvRows.push(''); // Empty row for spacing
    
    // Add teacher details if available
    if (selectedTeacher) {
      csvRows.push(`Teacher Name,${selectedTeacher.name}`);
      csvRows.push(`Teacher ID,${selectedTeacher.s_id || 'N/A'}`);
      if (selectedTeacher.email) csvRows.push(`Email,${selectedTeacher.email}`);
      if (selectedTeacher.department) csvRows.push(`Department,${selectedTeacher.department}`);
    }
    csvRows.push(''); // Empty row for spacing
    csvRows.push(''); // Empty row for spacing
    
    // Add attendance records header
    csvRows.push('Date,Status,Remarks');
    
    // Add attendance data
    sortedRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      const status = record.status.charAt(0).toUpperCase() + record.status.slice(1);
      // Escape quotes in remarks and wrap in quotes if present
      let remarks = record.remarks ? record.remarks.replace(/"/g, '""') : '';
      if (remarks) remarks = `"${remarks}"`;
      csvRows.push(`${date},${status},${remarks}`);
    });
    
    // Add summary statistics
    const totalRecords = sortedRecords.length;
    const presentCount = sortedRecords.filter(r => r.status === 'present').length;
    const absentCount = sortedRecords.filter(r => r.status === 'absent').length;
    const leaveCount = sortedRecords.filter(r => r.status === 'leave').length;
    
    csvRows.push(''); // Empty row for spacing
    csvRows.push(`Total Records,${totalRecords}`);
    csvRows.push(`Present,${presentCount}`);
    csvRows.push(`Absent,${absentCount}`);
    csvRows.push(`Leave,${leaveCount}`);
    
    const csvContent = csvRows.join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${teacherName}_attendance.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      // console.log('Attendance response:', response);
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
        <Navbar pageTitle={"Teacher Attendance Records"} role="admin" />
        
        {/* Back Button */}
        <div style={{ 
          padding: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Link 
            to="/admin/teachers/attendance"
            className="login-button"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#4b5563',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              border: '1px solid #374151',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            ← Back
          </Link>
        </div>
        
        <div className="form-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', background: 'var(--surface)', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px var(--border-color)' }}>
          <h2 style={{ marginBottom: '24px', color: 'var(--primary)', fontWeight: 700 }}>View and Manage Teacher Attendance</h2>
          
          <div style={{ 
            marginBottom: '28px', 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <label style={{ marginRight: '10px', fontWeight: 500, color: 'var(--text)', minWidth: '120px' }}>Select Teacher:</label>
              <select
                value={selectedTeacherId}
                onChange={handleTeacherChange}
                required
                style={{ 
                  padding: '10px', 
                  borderRadius: 6, 
                  border: '1px solid var(--border-color)', 
                  marginRight: '20px', 
                  flexGrow: 1,
                  maxWidth: '400px',
                  background: 'var(--input-background)', 
                  color: 'var(--input-text)' 
                }}
              >
                <option value="" style={{ background: 'var(--input-background)'}}>Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id} style={{ background: 'var(--input-background)'}}>
                    {teacher.name} ({teacher.s_id})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="login-button"
              style={{ 
                padding: '12px 24px', 
                background: 'var(--primary)', 
                color: 'var(--text-light)', 
                border: 'none', 
                borderRadius: 6, 
                fontWeight: 600, 
                cursor: 'pointer', 
                boxShadow: '0 1px 4px var(--border-color)',
                minWidth: '150px'
              }}
              onClick={handleFetchAttendance}
              disabled={!selectedTeacherId}
            >
              Get Attendance
            </button>
          </div>

          {error && <div className="error-message" style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
              {success}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>Loading...</div>
          ) : attendanceRecords.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '18px', color: 'var(--text-muted, #666)' }}>
              No attendance records found.
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: '0', color: 'var(--text)', fontWeight: '600' }}>
                  Attendance Records
                </h3>
                <button
                  onClick={handleExportToExcel}
                  className="login-button"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: '1px solid #047857',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  📊 Export to Excel
                </button>
              </div>

              {/* Teacher Information Header */}
              {selectedTeacherId && (
                <div style={{ 
                  padding: '24px',
                  marginBottom: '24px',
                  background: 'var(--surface)',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  {(() => {
                    const selectedTeacher = teachers.find(t => t._id === selectedTeacherId);
                    return selectedTeacher ? (
                      <>
                        <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', fontWeight: '600', fontSize: '1.25rem' }}>
                          Teacher Information
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                          <div>
                            <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Name</p>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '1rem' }}>{selectedTeacher.name}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>ID</p>
                            <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '1rem' }}>{selectedTeacher.s_id}</p>
                          </div>
                          {selectedTeacher.email && (
                            <div>
                              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Email</p>
                              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '1rem' }}>{selectedTeacher.email}</p>
                            </div>
                          )}
                          {selectedTeacher.department && (
                            <div>
                              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Department</p>
                              <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '1rem' }}>{selectedTeacher.department}</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'var(--surface)', borderRadius: 8, boxShadow: '0 1px 4px var(--border-color)', color: 'var(--text)' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Remarks</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record._id} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                        {editRecordId === record._id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--input-background)', color: 'var(--input-text)' }}
                          >
                            <option value="present" style={{ background: 'var(--input-background)'}}>Present</option>
                            <option value="absent" style={{ background: 'var(--input-background)'}}>Absent</option>
                            <option value="leave" style={{ background: 'var(--input-background)'}}>Leave</option>
                          </select>
                        ) : (
                          record.status
                        )}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                        {editRecordId === record._id ? (
                          <input
                            type="text"
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', width: '150px', background: 'var(--input-background)', color: 'var(--input-text)' }}
                            placeholder="Optional remarks"
                          />
                        ) : (
                          record.remarks
                        )}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                        {editRecordId === record._id ? (
                          <>
                            <button
                              type="button"
                              className="login-button"
                              style={{ marginRight: '5px', padding: '8px 16px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                              onClick={handleUpdateAttendance}
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="login-button"
                              style={{ padding: '8px 16px', background: 'var(--secondary, #64748b)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
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
                              style={{ marginRight: '5px', padding: '8px 16px', background: 'var(--primary)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
                              onClick={() => handleEditClick(record)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="login-button"
                              style={{ padding: '8px 16px', background: 'var(--danger)', color: 'var(--text-light)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px var(--border-color)' }}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherAttendance;
