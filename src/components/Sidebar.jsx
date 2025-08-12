import React, { useState, useEffect } from 'react';
import { useTheme } from '../Context';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';

function getInitialSidebarOpen() {
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    return false;
  }
  return true;
}

function Sidebar() {
  const { theme, isSidebarOpen, toggleSidebar } = useTheme();
  const { user } = useAuth();
  
  const [openSections, setOpenSections] = useState({
    classes: false,
    teachers: false,
    students: false,
    subjects: false,
    attendance: false,
    timetable: false,
    exams: false,
    examresults: false
  });

  // Close sections when sidebar closes (for better UX)
  useEffect(() => {
    if (!isSidebarOpen) {
      setOpenSections({ 
        classes: false, 
        teachers: false, 
        students: false, 
        subjects: false,
        attendance: false,
        timetable: false,
        exams: false,
        examresults: false
      });
    }
  }, [isSidebarOpen]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle overlay click to close sidebar
  const handleOverlayClick = () => {
    toggleSidebar();
  };

  return (
    <React.Fragment>
      {/* Overlay for mobile/tablet */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1199,
            display: 'block',
          }}
        />
      )}
      <div className={`sidebar${isSidebarOpen ? ' open' : ''}`} data-theme={theme}>
        <div className="profile-section">
          <div className="profile-image">{user?.Name?.charAt(0) || 'A'}</div>
          <h3>{user?.Name || 'Loading...'}</h3>
          <p>{user?.email || 'Loading...'}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" data-icon="🏠">Dashboard</Link>
          {/* Classes */}
          <div className="nav-group">
            <Link to="/admin/classes" data-icon="📚">Classes</Link>
          </div>
          {/* Teachers */}
          <div className="nav-group">
            <Link to="/admin/teachers" data-icon="👩‍🏫">Teachers</Link>
          </div>
          {/* Notes */}
          <div className="nav-group">
            <Link to="/admin/notes" data-icon="📝">Study Notes</Link>
          </div>
          {/* Students */}
          <div className="nav-group">
            <Link to="/admin/students" data-icon="👩‍🎓">Students</Link>
          </div>
          {/* Subjects */}
          {/* <div className="nav-group">
            <span className="nav-group-title" data-icon="📖" onClick={() => toggleSection('subjects')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('subjects')}>Subjects</span>
            <div className={`nav-subgroup ${openSections.subjects ? 'open' : ''}`}>
              <Link to="/admin/subjects" data-icon="📋">All Subjects</Link>
              <Link to="/admin/subjects/add" data-icon="➕">Add Subject</Link>
            </div>
          </div> */}
          <Link to="/admin/subjects" data-icon="📖">Subjects</Link>
          {/* Attendance */}
          {/* <div className="nav-group">
            <span className="nav-group-title" data-icon="📊" onClick={() => toggleSection('attendance')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('attendance')}>Attendance</span>
            <div className={`nav-subgroup ${openSections.attendance ? 'open' : ''}`}>
              <Link to="/admin/teachers/attendance" data-icon="📝">Mark Teacher Attendance</Link>
              <Link to="/admin/teacher-attendance" data-icon="📅">View Teacher Attendance</Link>
              <Link to="/admin/teacher-attendance/update/:attendanceId" data-icon="✏️">Update Teacher Attendance</Link>
            </div>
          </div> */}
          <Link to="/admin/teachers/attendance" data-icon="📊">Attendance</Link>
          {/* Timetable */}
          {/* <div className="nav-group">
            <span className="nav-group-title" data-icon="📅" onClick={() => toggleSection('timetable')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('timetable')}>Timetable</span>
            <div className={`nav-subgroup ${openSections.timetable ? 'open' : ''}`}>
              <Link to="/admin/mapped" data-icon="🔗">Create Mapped Relations</Link>
              <Link to="/admin/timetable/view-mappings" data-icon="🔍">View Class Mappings</Link>
              <Link to="/admin/timetable/create" data-icon="🗓️">Create Timetable</Link>
              <Link to="/admin/timetable/getall" data-icon="📋">Get All Timetables</Link>
            </div>
          </div> */}
          <Link to="/admin/timetable/getall" data-icon="📅">Timetables</Link>
          {/* Mapped Relations */}
          <Link to="/admin/timetable/view-mappings" data-icon="🔗">Mapped Relations</Link>
          {/* Exams */}
          {/* <div className="nav-group">
            <span className="nav-group-title" data-icon="📝" onClick={() => toggleSection('exams')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('exams')}>Exams</span>
            <div className={`nav-subgroup ${openSections.exams ? 'open' : ''}`}>
              <Link to="/admin/exams/create" data-icon="➕">Create Exam</Link>
              <Link to="/admin/exams/getall" data-icon="📋">All Exams</Link>
            </div>
          </div> */}
          <Link to="/admin/exams/getall" data-icon="📝">Exams</Link>
          {/* Exam Results */}
          {/* <div className="nav-group">
            <span className="nav-group-title" data-icon="📊" onClick={() => toggleSection('examresults')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('examresults')}>Exam Results</span>
            <div className={`nav-subgroup ${openSections.examresults ? 'open' : ''}`}>
              <Link to="/admin/examresult/create" data-icon="➕">Create Exam Result</Link>
              <Link to="/admin/examresult/getbyexam/:examId" data-icon="📋">All Results by Exam</Link>
              <Link to="/admin/examresult/update/:resultId" data-icon="✏️">Update Exam Result</Link>
            </div>
          </div> */}
          <Link to="/admin/examresult/getbyexam/:examId" data-icon="📋">Exam Results</Link>
          {/* Payments */}
          <Link to="/admin/payments" data-icon="💰">Payment Information</Link>
        </nav>
        <div className="sidebar-actions">
          <button 
            className="close-sidebar" 
            onClick={toggleSidebar} 
            aria-label="Close Sidebar"
          >
            &times;
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Sidebar;