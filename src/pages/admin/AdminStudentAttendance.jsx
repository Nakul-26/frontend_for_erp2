// src/pages/AdminStudentAttendance.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/Login.css'; // This import might not be directly relevant for the visual layout of this page, but kept as per original.
import '../../styles/Table.css'; // Added for table specific styles if not already globally imported.
//import '../../styles/AdminStudentAttendance.css'; // Added for specific student attendance page styles.

// Lazy load components for better performance
const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));
const Table = lazy(() => import('../../components/Table')); // Assuming a generic Table component exists

const AdminStudentAttendance = () => {
  // Updated student data structure based on the provided schema
  const [students, setStudents] = useState([
    {
      id: 'S001',
      s_id: 'S001', // Corresponds to the schema's s_id
      name: 'Emily White',
      email: 'emily.w@example.com',
      password: 'hashedpassword1', // Should not be in frontend state in real app
      Age: 16,
      dateOfBirth: '2009-03-15',
      address: '123 Oak Ave, Townsville',
      phone: '555-0101',
      dateOfAdmission: '2024-09-01',
      class: 'Grade 10A', // Matches existing class structure
      fatherName: 'John White',
      fatherPhoneNumber: '555-0102',
      fatherOccupation: 'Engineer',
      motherName: 'Sarah White',
      motherPhoneNumber: '555-0103',
      motherOccupation: 'Designer',
      Qualification: 'High School',
    },
    {
      id: 'S002',
      s_id: 'S002',
      name: 'David Green',
      email: 'david.g@example.com',
      password: 'hashedpassword2',
      Age: 15,
      dateOfBirth: '2010-07-22',
      address: '456 Pine St, Villageton',
      phone: '555-0104',
      dateOfAdmission: '2024-09-01',
      class: 'Grade 10B',
      fatherName: 'Michael Green',
      fatherPhoneNumber: '555-0105',
      fatherOccupation: 'Doctor',
      motherName: 'Linda Green',
      motherPhoneNumber: '555-0106',
      motherOccupation: 'Teacher',
      Qualification: 'High School',
    },
    {
      id: 'S003',
      s_id: 'S003',
      name: 'Sophia Blue',
      email: 'sophia.b@example.com',
      password: 'hashedpassword3',
      Age: 16,
      dateOfBirth: '2009-11-05',
      address: '789 Elm Rd, Cityburg',
      phone: '555-0107',
      dateOfAdmission: '2024-09-01',
      class: 'Grade 10A',
      fatherName: 'Robert Blue',
      fatherPhoneNumber: '555-0108',
      fatherOccupation: 'Architect',
      motherName: 'Nancy Blue',
      motherPhoneNumber: '555-0109',
      motherOccupation: 'Artist',
      Qualification: 'High School',
    },
  ]);

  const [classes, setClasses] = useState([
    { id: 'C10A', name: 'Grade 10A' },
    { id: 'C10B', name: 'Grade 10B' },
    { id: 'C11A', name: 'Grade 11A' },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, studentId: 'S001', date: '2025-06-01', classId: 'C10A', status: 'Present' },
    { id: 2, studentId: 'S002', date: '2025-06-01', classId: 'C10B', status: 'Present' },
    { id: 3, studentId: 'S003', date: '2025-06-01', classId: 'C10A', status: 'Absent' },
    { id: 4, studentId: 'S001', date: '2025-06-02', classId: 'C10A', status: 'Present' },
    { id: 5, studentId: 'S002', date: '2025-06-02', classId: 'C10B', status: 'Late' },
  ]);

  const [filteredClassId, setFilteredClassId] = useState('');
  const [filteredStudentId, setFilteredStudentId] = useState('');
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

    if (filteredClassId) {
      tempRecords = tempRecords.filter(record => record.classId === filteredClassId);
    }
    if (filteredStudentId) {
      tempRecords = tempRecords.filter(record => record.studentId === filteredStudentId);
    }
    if (filteredDate) {
      tempRecords = tempRecords.filter(record => record.date === filteredDate);
    }
    setFilteredRecords(tempRecords);
  }, [filteredClassId, filteredStudentId, filteredDate, attendanceRecords]);

  const handleClearFilters = () => {
    setFilteredClassId('');
    setFilteredStudentId('');
    setFilteredDate('');
  };

  const getStudentsInFilteredClass = () => {
    if (filteredClassId) {
      // Filter students by their 'class' property which matches the 'name' of the selected class
      return students.filter(student => student.class === classes.find(c => c.id === filteredClassId)?.name);
    }
    return students;
  };

  // Define table columns for attendance records
  const attendanceColumns = [
    { key: 'studentName', label: 'Student Name', accessor: (record) => students.find(s => s.id === record.studentId)?.name || 'N/A' },
    { key: 'className', label: 'Class', accessor: (record) => classes.find(c => c.id === record.classId)?.name || 'N/A' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <Suspense fallback={<div>Loading application components...</div>}>
      <div className="dashboard-container">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
          <Navbar role="admin" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <header className="dashboard-header">
            <h1>Student Attendance Overview</h1>
            <p className="dashboard-subtitle">View and manage student attendance records</p>
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
                id="class-select"
                value={filteredClassId}
                onChange={(e) => {
                  setFilteredClassId(e.target.value);
                  setFilteredStudentId(''); // Reset student selection when class changes
                }}
                className="filter-select"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>

              <select
                id="student-select"
                value={filteredStudentId}
                onChange={(e) => setFilteredStudentId(e.target.value)}
                className="filter-select"
                disabled={!filteredClassId && !filteredStudentId} // Disable if no class selected and no student filter is active
              >
                <option value="">All Students</option>
                {getStudentsInFilteredClass().map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
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
                  {/* The Table component here is for attendance records, not student profiles directly */}
                  <Table data={filteredRecords} columns={attendanceColumns} />
                </Suspense>
              ) : (
                <div className="cards-grid">
                  {/* This maps attendance records to student cards */}
                  {filteredRecords.map((record) => {
                    const student = students.find(s => s.id === record.studentId);
                    const studentClass = classes.find(c => c.id === record.classId);
                    return (
                      <div key={record.id} className="card">
                        <h3>{student ? student.name : 'N/A'}</h3>
                        <div className="card-content">
                          <p><strong>Student ID:</strong> {student ? student.s_id : 'N/A'}</p>
                          <p><strong>Class:</strong> {studentClass ? studentClass.name : 'N/A'}</p>
                          <p><strong>Date:</strong> {record.date}</p>
                          <p><strong>Status:</strong> {record.status}</p>
                          {/* Display additional student details from the updated schema */}
                          <p><strong>Email:</strong> {student ? student.email : 'N/A'}</p>
                          <p><strong>Phone:</strong> {student ? student.phone : 'N/A'}</p>
                          <p><strong>Admission Date:</strong> {student ? student.dateOfAdmission : 'N/A'}</p>
                          <p><strong>Father's Name:</strong> {student ? student.fatherName : 'N/A'}</p>
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

export default AdminStudentAttendance;