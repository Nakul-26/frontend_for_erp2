// src/pages/TeacherSettings.jsx
import React from 'react';
import '../../styles/Dashboard.css';
import TeacherSidebar from '../../components/TeacherSidebar';

function TeacherSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const teacherData = JSON.parse(localStorage.getItem('teacherData')) || {};

  return (
    <div className="dashboard-container">
      <TeacherSidebar teacherData={teacherData} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <h2>Settings</h2>
        <p>This feature is under development.</p>
      </main>
    </div>
  );
}

export default TeacherSettings;