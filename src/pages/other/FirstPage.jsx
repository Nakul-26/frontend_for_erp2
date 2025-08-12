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
    <div className="index-background">
      <div className="index-container">
        <h1 className="index-title">ERP System</h1>
        <p className="index-subtitle">Select your role to log in</p>
        <div className="index-buttons">
          {roles.map((role, index) => (
            <Link
              key={index}
              to={role.path}
              className="index-button"
              aria-label={`Login as ${role.label}`}
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
