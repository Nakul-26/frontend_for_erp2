// src/pages/AdminTeacherAttendance.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/Login.css';

// Lazy load components for better performance
const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));
const Table = lazy(() => import('../../components/Table'));

const AdminTeacherAttendance = () => {
  const [teachers, setTeachers] = useState([
    { id: 'T001', name: 'Alice Smith', department: 'Mathematics' },
    { id: 'T002', name: 'Bob Johnson', department: 'Science' },
    { id: 'T003', name: 'Charlie Brown', department: 'English' },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, teacherId: 'T001', date: '2025-06-01', status: 'Present', checkIn: '08:55 AM', checkOut: '04:05 PM' },
    { id: 2, teacherId: 'T002', date: '2025-06-01', status: 'Present', checkIn: '08:58 AM', checkOut: '04:00 PM' },
    { id: 3, teacherId: 'T003', date: '2025-06-01', status: 'Absent', checkIn: '', checkOut: '' },
    { id: 4, teacherId: 'T001', date: '2025-06-02', status: 'Present', checkIn: '09:00 AM', checkOut: '04:10 PM' },
    { id: 5, teacherId: 'T002', date: '2025-06-02', status: 'Leave', checkIn: '', checkOut: '' },
  ]);

  const [filteredTeacherId, setFilteredTeacherId] = useState('');
  const [filteredDate, setFilteredDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [isTableView, setIsTableView] = useState(true);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let tempRecords = attendanceRecords;

    if (filteredTeacherId) {
      tempRecords = tempRecords.filter(record => record.teacherId === filteredTeacherId);
    }
    if (filteredDate) {
      tempRecords = tempRecords.filter(record => record.date === filteredDate);
    }
    setFilteredRecords(tempRecords);
  }, [filteredTeacherId, filteredDate, attendanceRecords]);

  const handleClearFilters = () => {
    setFilteredTeacherId('');
    setFilteredDate('');
  };

  // Define table columns
  const attendanceColumns = [
    { key: 'teacherName', label: 'Teacher Name', accessor: (record) => teachers.find(t => t.id === record.teacherId)?.name || 'N/A' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'checkOut', label: 'Check-out' }
  ];

  return (
    <Suspense fallback={<div>Loading application components...</div>}>
      <div className="dashboard-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <header className="dashboard-header">
            <h1>Teacher Attendance Overview</h1>
            <p className="dashboard-subtitle">View and manage teacher attendance records</p>
          </header>

          <div className="action-and-filter-bar">
            <div className="action-buttons">
              <button
                onClick={() => setIsTableView(!isTableView)}
                className="login-button"
                style={{ minWidth: '120px' }}
              >
                {isTableView ? 'Show Card View' : 'Show Table View'}
              </button>
            </div>

            <div className="filter-controls">
              <h3>Filter By:</h3>
              <select
                id="teacher-select"
                value={filteredTeacherId}
                onChange={(e) => setFilteredTeacherId(e.target.value)}
                className="filter-select"
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>

              <input
                id="date-input"
                type="date"
                value={filteredDate}
                onChange={(e) => setFilteredDate(e.target.value)}
                className="filter-select"
              />

              <button className="login-button" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          </div>

          <div className="table-container">
            {filteredRecords.length > 0 ? (
              isTableView ? (
                <Suspense fallback={<div>Loading table view...</div>}>
                  <Table data={filteredRecords} columns={attendanceColumns} />
                </Suspense>
              ) : (
                <div className="cards-grid">
                  {filteredRecords.map((record) => {
                    const teacher = teachers.find(t => t.id === record.teacherId);
                    return (
                      <div key={record.id} className="card">
                        <h3>{teacher ? teacher.name : 'N/A'}</h3>
                        <div className="card-content">
                          <p><strong>Date:</strong> {record.date}</p>
                          <p><strong>Status:</strong> {record.status}</p>
                          <p><strong>Check-in:</strong> {record.checkIn || 'N/A'}</p>
                          <p><strong>Check-out:</strong> {record.checkOut || 'N/A'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="no-data-message">No attendance records found for the selected criteria.</p>
            )}
          </div>
        </main>
      </div>
    </Suspense>
  );
};

export default AdminTeacherAttendance;