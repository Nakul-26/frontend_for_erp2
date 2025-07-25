import React from 'react';
import '../../styles/Dashboard.css';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';

function TeacherAttendancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar role="teacher" />
        <h2>Attendance</h2>
        <p>Attendance marking functionality to be implemented.</p>
      </main>
    </div>
  );
}

export default TeacherAttendancePage;