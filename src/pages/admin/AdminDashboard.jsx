import React, { useState, lazy, Suspense, useEffect } from 'react';
import { FaIdCard, FaUser, FaEnvelope, FaShieldAlt, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import '../../styles/Dashboard.css';
import '../../styles/MobileResponsive.css';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import { useTheme } from '../../Context';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function AdminDashboard() {
  const { theme } = useTheme(); // Get theme from context
  console.log(`Admin Dashboard theme: ${theme}`);

  // Set theme to light on component mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const { user } = useAuth(); // Get admin data from context

  // console.log('Admin Dashboard admin data:', user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const truncateText = (text, maxLength) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const stats = [
    { icon: <FaIdCard />, title: 'Admin ID', value: user?.id || '-' },
    { icon: <FaUser />, title: 'Name', value: user?.Name || '-' },
    { icon: <FaEnvelope />, title: 'Email', value: truncateText(user?.email, 18) },
    { icon: <FaShieldAlt />, title: 'Role', value: user?.isAdmin ? 'Admin' : 'Non-Admin' },
  ];

  // Data for teacher attendance section (would typically come from API)
  const [teacherAbsentees, setTeacherAbsentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch teacher attendance data from the API
  const fetchTeacherAbsentees = async () => {
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    try {
      // First, get a list of all teachers to iterate through their attendance
      const teachersResponse = await axios.get(
        `${API_BASE_URL}/api/v1/admin/getallteacher`,
        { withCredentials: true }
      );
      
      if (teachersResponse.data.success) {
        const teachers = teachersResponse.data.data;
        const absentTeachers = [];
        
        // If we have at least one teacher, get their attendance
        if (teachers && teachers.length > 0) {
          // Use the first teacher's ID to get attendance records
          const teacherId = teachers[0]._id || teachers[0].s_id || 'admin';
          
          // Fetch attendance records using the format from GetTeacherAttendance.jsx
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/teacher-attendance/${teacherId}`,
            { withCredentials: true }
          );
          
          if (response.data.status === 200) {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            
            // Filter for absent teachers only and from today
            const absences = response.data.data.filter(record => 
              record.status === 'absent' && record.date && record.date.includes(today)
            );
            
            setTeacherAbsentees(absences || []);
          } else {
            setTeacherAbsentees([]);
          }
        }
      } else {
        throw new Error('Failed to fetch teachers data');
      }
      } catch (err) {
        setError('Unable to fetch teacher attendance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    fetchTeacherAbsentees();
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="dashboard-container">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`} style={{ color: 'var(--text)' }}>
          <Navbar pageTitle={"Dashboard"} role="user" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="stat-icon" style={{ color: 'var(--primary)' }}>{stat.icon}</div>
                <div className="stat-info">
                  <h3 style={{ 
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    {stat.value}
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="dashboard-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', /* Make both sections equal width (50% each) */
            gap: '20px', 
            marginTop: '20px' 
          }}>
            <section className="schedule-section teacher-attendance" style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', padding: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: '500', marginTop: '0', color: 'var(--text)' }}>
                <FaUserTimes style={{ marginRight: '8px' }} />
                Teachers Attendance
                <span style={{ fontSize: '14px', marginLeft: 'auto', color: 'var(--primary)' }}>
                  <Link to="/admin/teacher-attendance" style={{ 
                    color: 'var(--primary)',
                    textDecoration: 'none'
                  }}>
                    (View All)
                  </Link>
                </span>
              </h2>
              {loading ? (
                <div className="loading-indicator">Loading teacher attendance data...</div>
              ) : error ? (
                <div className="schedule-list">
                  <div className="schedule-item" style={{ backgroundColor: 'var(--surface-variant)' }}>
                    <div className="time">
                      <FaUserTimes style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="class-info">
                      <h4>Attendance System</h4>
                      <p style={{ color: 'var(--danger)' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="schedule-list">
                  {teacherAbsentees.length > 0 ? (
                    teacherAbsentees.map((record, index) => (
                      <div key={index} className="schedule-item">
                        <div className="time">
                          <FaUserTimes style={{ color: 'var(--danger, red)' }} />
                        </div>
                        <div className="class-info">
                          <h4>{record.teacherId || record.teacherName || "Teacher"}</h4>
                          <p>Status: <span style={{ color: 'var(--danger, red)' }}>Absent</span> | {record.date ? new Date(record.date).toLocaleDateString() : ""}</p>
                          {record.remarks && <p>Note: {record.remarks}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center', 
                      padding: '30px', 
                      height: '100%',
                      minHeight: '100px'
                    }}>
                      <h3 style={{ margin: '10px 0', fontSize: '18px', fontWeight: '500', color: 'var(--text)' }}>No Absent Teachers</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        All teachers are present today.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
            <section className="schedule-section student-attendance" style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', padding: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: '500', marginTop: '0', color: 'var(--text)' }}>
                <FaUserCheck style={{ marginRight: '8px' }} />
                Student Attendance
                <span style={{ fontSize: '14px', marginLeft: 'auto', color: 'var(--primary)' }}>
                  <Link to="/admin/student-attendance" style={{ 
                    color: 'var(--primary)',
                    textDecoration: 'none'
                  }}>
                    (View All)
                  </Link>
                </span>
              </h2>
              <div className="schedule-list">
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center', 
                  padding: '30px', 
                  height: '100%',
                  minHeight: '100px'
                }}>
                  <h3 style={{ margin: '10px 0', fontSize: '18px', fontWeight: '500', color: 'var(--text)' }}>Coming Soon</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Student attendance viewing functionality will be available shortly.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

export default AdminDashboard;
