import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function getInitialSidebarOpen() {
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    return false;
  }
  return true;
}

function Sidebar({ adminData, isOpen, setIsOpen }) {
  const [openSections, setOpenSections] = useState({
    classes: false,
    teachers: false,
    students: false,
    subjects: false,
  });

  // Close sidebar on route change (optional, for better UX)
  useEffect(() => {
    if (isOpen === undefined) return;
    if (!isOpen) {
      setOpenSections({ classes: false, teachers: false, students: false, subjects: false });
    }
  }, [isOpen]);

  // Hide sidebar by default on small screens
  useEffect(() => {
    if (typeof isOpen === 'undefined' && typeof setIsOpen === 'function') {
      setIsOpen(getInitialSidebarOpen());
    }
    // eslint-disable-next-line
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Sidebar open/close for mobile
  const sidebarClass = () => {
    if (typeof isOpen === 'boolean') {
      return `sidebar${isOpen ? ' open' : ''}`;
    }
    return 'sidebar';
  };

  return (
    <div className={sidebarClass()}>
      <div className="profile-section">
        <div className="profile-image">{adminData?.Name?.charAt(0) || 'A'}</div>
        <h3>{adminData?.Name || 'Loading...'}</h3>
        <p>{adminData?.email || 'Loading...'}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" data-icon="🏠">Dashboard</Link>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📚"
            onClick={() => toggleSection('classes')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('classes')}
          >
            Classes
          </span>
          <div className={`nav-subgroup ${openSections.classes ? 'open' : ''}`}>
            <Link to="/admin/classes" data-icon="👥">All Classes</Link>
            <Link to="/admin/classes/add" data-icon="➕">Add Class</Link>
            {/* <Link to="/admin/classes/modify" data-icon="✏️">Modify Class</Link> */}
            {/* <Link to="/admin/classes/delete" data-icon="🗑️">Delete Class</Link> */}
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="👩‍🏫"
            onClick={() => toggleSection('teachers')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('teachers')}
          >
            Teachers
          </span>
          <div className={`nav-subgroup ${openSections.teachers ? 'open' : ''}`}>
            <Link to="/admin/teachers" data-icon="👥">All Teachers</Link>
            <Link to="/admin/teachers/register" data-icon="➕">Register Teacher</Link>
            {/* <Link to="/admin/teachers/modify" data-icon="✏️">Modify Teacher</Link> */}
            {/* <Link to="/admin/teachers/delete" data-icon="🗑️">Delete Teacher</Link> */}
            <Link to="/admin/teachers/attendance" data-icon="📝">Teacher Attendance</Link>
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="👩‍🎓"
            onClick={() => toggleSection('students')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('students')}
          >
            Students
          </span>
          <div className={`nav-subgroup ${openSections.students ? 'open' : ''}`}>
            <Link to="/admin/students" data-icon="👥">All Students</Link>
            <Link to="/admin/students/register" data-icon="➕">Register Student</Link>
            <Link to="/admin/students/modify" data-icon="✏️">Modify Student</Link>
            <Link to="/admin/students/delete" data-icon="🗑️">Delete Student</Link>
            <Link to="/admin/students/attendance" data-icon="📝">Student Attendance</Link>
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📖"
            onClick={() => toggleSection('subjects')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('subjects')}
          >
            Subjects
          </span>
          <div className={`nav-subgroup ${openSections.subjects ? 'open' : ''}`}>
            <Link to="/admin/subjects" data-icon="📋">All Subjects</Link>
            <Link to="/admin/subjects/add" data-icon="➕">Add Subject</Link>
            <Link to="/admin/subjects/update" data-icon="✏️">Update Subject</Link>
            <Link to="/admin/subjects/delete" data-icon="🗑️">Delete Subject</Link>
            <Link to="/admin/subjects/search" data-icon="🔍">Search Subject</Link>
          </div>
        </div>
        <div className="nav-group">
          <span
            className="nav-group-title"
            data-icon="📊"
            onClick={() => toggleSection('attendance')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('attendance')}
          >
            Attendance
          </span>
          <div className={`nav-subgroup ${openSections.attendance ? 'open' : ''}`}>
            <Link to="/admin/adminstudentattendance" data-icon="👩‍🎓">Student Attendance</Link>
            <Link to="/admin/adminteacherattendance" data-icon="👨‍🏫">Teacher Attendance</Link>
          </div>
        </div>
        <Link to="/admin/mapped" data-icon="🔗">Mapped</Link>
        <Link to="/admin/timetable-pdf" data-icon="📄">Timetable PDF Generator</Link>

        <Link to="/admin/timetable/create" data-icon="🗓️">Generate Timetable</Link>

        <Link to="/admin/timetable/view-mappings" data-icon="🔍">View Class Mappings</Link>
        
        {/* <Link to="/admin/parents/add" data-icon="➕">Add Parent</Link>
        <Link to="/admin/parents" data-icon="👪">Parents</Link>
        <Link to="/admin/holidays" data-icon="📅">Holidays</Link>
        <Link to="/admin/leave" data-icon="📝">Leave Management</Link>
        <Link to="/admin/teachers/leave" data-icon="🛌">Leave Requests</Link>
        <Link to="/admin/fees" data-icon="💰">Fees</Link>
        <Link to="/admin/subjects" data-icon="📚">Subjects</Link>
        <Link to="/admin/marks" data-icon="📈">Marks</Link>
        <Link to="/admin/exams" data-icon="📝">Exams</Link>
        <Link to="/admin/assignments" data-icon="📅">Assignments</Link>
        <Link to="/admin/notifications" data-icon="🔔">Notifications</Link> */}
        <Link to="/admin/departments" data-icon="🏢">Departments</Link>
        <Link to="/admin/settings" data-icon="⚙️">Settings</Link>
      </nav>
      {/* Mobile close button */}
      {typeof isOpen === 'boolean' && setIsOpen && (
        <button
          className="sidebar-close-btn"
          style={{ display: 'block' }}
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Sidebar;