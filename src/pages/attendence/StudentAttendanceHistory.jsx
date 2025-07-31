// src/pages/StudentAttendanceHistory.jsx
import React from 'react';
import '../../styles/Dashboard.css';
import StudentSidebar from '../../components/StudentSidebar';

function StudentAttendanceHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const studentData = JSON.parse(localStorage.getItem('studentData')) || {};

  return (
    <div className="dashboard-container">
      <StudentSidebar studentData={studentData} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <h2>Attendance History</h2>
        <p>This feature is under development.</p>
      </main>
    </div>
  );
}

export default StudentAttendanceHistory;