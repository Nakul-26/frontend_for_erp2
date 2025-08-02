import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/FirstPage.css';


const roles = [
  { path: '/teacher/login', label: 'Teacher Login' },
  { path: '/student/login', label: 'Student Login' },
  // Uncomment below if admin login needs to be enabled
  { path: '/admin/login', label: 'Admin Login' },
];

function Index() {
  return (
    <div className="index-background" style={{ background: "var(--background)", color: "var(--text)" }}>
      <div className="index-container" style={{ background: "var(--surface)", color: "var(--text)" }}>
        <h1 style={{ color: "var(--text-dark)" }}>Welcome to ERP System</h1>
        <p style={{ color: "var(--text-muted)" }}>Please select your role to log in:</p>
        <div className="index-buttons">
          {roles.map((role, index) => (
            <Link
              key={index}
              to={role.path}
              className="index-button"
              aria-label={`Login as ${role.label}`}
              style={{ background: "var(--primary)", color: "var(--text-light)" }}
            >
              {role.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Index;
