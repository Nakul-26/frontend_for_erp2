// src/components/TeacherSidebar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function TeacherSidebar({ teacherData }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      {/* <button className="toggle-button" onClick={toggleSidebar}>
        {isSidebarOpen ? '◄' : '►'}
      </button> */}
      <div className="profile-section">
        <div className="profile-image">{teacherData?.name?.charAt(0) || 'T'}</div>
        <h3>{teacherData?.name || 'Loading...'}</h3>
        <p>{teacherData?.email || 'Loading...'}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/teacher/dashboard" data-icon="🏠">Dashboard</Link>
        <Link to="/teacher/timetable" data-icon="📅">Timetable</Link>
        {/* New link for attendance */}
        <Link to="/teacher/studentattendance" data-icon="✔️">Take Attendance</Link>
        <Link to="/teacher/attendance/history" data-icon="📝">Attendance History</Link> {/* Keep this for history view */}
        <Link to="/teacher/grades" data-icon="📊">Grades</Link>
        <Link to="/teacher/changepassword" data-icon="🔒">Change Password</Link>
        <Link to="/teacher/settings" data-icon="⚙️">Settings</Link>
      </nav>
    </aside>
  );
}

export default TeacherSidebar;