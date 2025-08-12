import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function GetStudentAttendance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar pageTitle={"View Student Attendance"} role="admin" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <div className="form-container" style={{ 
          width: '100%', 
          maxWidth: '100%', 
          margin: 0, 
          background: 'var(--surface)', 
          padding: 32, 
          borderRadius: 12, 
          boxShadow: '0 2px 8px var(--border-color)' 
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px 20px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              color: 'var(--primary)',
              marginBottom: '20px'
            }}>
              Student Attendance View
            </h2>
            
            <div style={{
              background: 'var(--surface-variant, #f5f5f5)',
              borderRadius: '8px',
              padding: '30px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '600px',
              border: '1px dashed var(--border-color)'
            }}>
              <h3 style={{ 
                fontSize: '20px',
                marginBottom: '15px',
                color: 'var(--text)'
              }}>
                Coming Soon
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                The student attendance view feature is currently under development.
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                This feature will allow you to view and manage student attendance records, similar to how teacher attendance works.
              </p>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                Expected API endpoint: <code style={{ background: '#33333320', padding: '4px 8px', borderRadius: '4px' }}>
                  /api/v1/admin/student-attendance/:studentId
                </code>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GetStudentAttendance;
