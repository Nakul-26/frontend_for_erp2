import React from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function DepartmentsPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar role="admin" />
        <h2>Manage Departments</h2>
        <p>Department management functionality to be implemented.</p>
      </main>
    </div>
  );
}

export default DepartmentsPage;