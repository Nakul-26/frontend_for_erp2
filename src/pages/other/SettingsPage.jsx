import React from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function SettingsPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar role="admin" />
        <h2>Settings</h2>
        <p>User settings functionality to be implemented.</p>
      </main>
    </div>
  );
}

export default SettingsPage;