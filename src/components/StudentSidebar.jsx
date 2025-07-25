// src/components/StudentSidebar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function StudentSidebar({ studentData }) {
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
        <div className="profile-image">{studentData?.name?.charAt(0) || 'S'}</div>
        <h3>{studentData?.name || 'Loading...'}</h3>
        <p>{studentData?.email || 'Loading...'}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/student/dashboard" data-icon="🏠">Dashboard</Link>
        <Link to="/student/timetable" data-icon="📅">Timetable</Link>
        <Link to="/student/attendance/history" data-icon="📝">Attendance History</Link>
        <Link to="/student/settings" data-icon="⚙️">Settings</Link>
      </nav>
    </aside>
  );
}

export default StudentSidebar;