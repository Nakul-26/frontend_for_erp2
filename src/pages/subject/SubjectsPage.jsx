// src/pages/SubjectsPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';
import '../../styles/Card.css';
import '../../styles/InputForm.css';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import SubjectCard from '../../components/SubjectCard';
import { useAuth } from '../../context/AuthContext';

function SubjectsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const { adminData } = useAuth();
  const navigate = useNavigate();

  // State for Filters
  const [filters, setFilters] = useState({
    courseType: '',
    status: '',
    lectureHours: ''
  });

  // State for Sorting
  const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });

  // States to hold unique filter options
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState([]);
  const [uniqueLectureHours, setUniqueLectureHours] = useState([]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // This function fetches all subjects from the backend
  const fetchSubjects = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/getall`,
        { withCredentials: true }
      );
      if (response.data.status === "success" && Array.isArray(response.data.subjects)) {
        setSubjects(response.data.subjects);

        // Extract unique filter options
        const courseTypes = [...new Set(response.data.subjects
          .map(subject => subject.courseType)
          .filter(Boolean))].sort();
        setUniqueCourseTypes(['', ...courseTypes]);

        const hours = [...new Set(response.data.subjects
          .map(subject => subject.lectureHours)
          .filter(Boolean))].sort((a, b) => a - b);
        setUniqueLectureHours(['', ...hours]);
      } else {
        setSubjects([]);
        throw new Error(response.data.message || 'Failed to fetch subjects or invalid data format.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch subjects from backend.');
      console.error('Fetch Subjects Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortField') {
      setSortBy(prev => ({ ...prev, field: value }));
    } else if (name === 'sortOrder') {
      setSortBy(prev => ({ ...prev, order: value }));
    }
  };

  const clearFiltersAndSort = () => {
    setFilters({ courseType: '', status: '', lectureHours: '' });
    setSortBy({ field: '', order: 'asc' });
  };

  // Memoized filtered and sorted subjects
  const filteredAndSortedSubjects = useMemo(() => {
    let currentSubjects = [...subjects];

    // Apply Filters
    currentSubjects = currentSubjects.filter(subject => {
      let matches = true;
      if (filters.courseType && String(subject.courseType) !== filters.courseType) matches = false;
      if (filters.status && String(subject.isActive).toLowerCase() !== filters.status.toLowerCase()) matches = false;
      if (filters.lectureHours && String(subject.lectureHours) !== filters.lectureHours) matches = false;
      return matches;
    });

    // Apply Sort
    if (sortBy.field) {
      currentSubjects.sort((a, b) => {
        let aValue = a[sortBy.field];
        let bValue = b[sortBy.field];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortBy.order === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortBy.order === 'asc' ? -1 : 1;

        // Handle numeric values
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortBy.order === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle string comparisons
        const valA = String(aValue);
        const valB = String(bValue);
        return sortBy.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return currentSubjects;
  }, [subjects, filters, sortBy]);

  const handleDeleteSubject = async (codeToDelete) => {
    setError('');
    setSuccess(''); // Clear previous messages

    if (!window.confirm(`Are you sure you want to delete subject ${codeToDelete}?`)) {
      return; // Stop if user cancels
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    try {
      // Assuming your DELETE endpoint is consistent with SubjectCard and UpdateSubjectPage,
      // which often use a URL parameter for ID/code in DELETE requests.
      // If your backend specifically expects a query parameter, keep `?code=${codeToDelete}`
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/admin/subdelete?code=${codeToDelete}`, // More RESTful DELETE endpoint
        // Or if your backend truly expects query: `${API_BASE_URL}/api/v1/admin/subdelete?code=${codeToDelete}`,
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setSuccess(`Subject '${codeToDelete}' deleted successfully!`);
        // Update the state directly to remove the deleted subject without full page refresh
        setSubjects(prevSubjects => prevSubjects.filter(sub => sub.code !== codeToDelete));
        // You can remove the setTimeout(navigate...) here as state update is sufficient
        // setTimeout(() => navigate('/admin/subjects'), 2000);
      } else {
        throw new Error(response.data.message || 'Failed to delete subject');
      }
    } catch (err) {
      console.error('Delete Subject Error:', err);
      setError(err.response?.data?.message || 'Unable to delete subject via backend.');
    }
  };

  // No table columns needed anymore as we're only using card view

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
      <Navbar pageTitle={"Subject Management"} role="admin" toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        {/* <header className="dashboard-header">
          <h1>Subjects Management</h1>
          <p className="dashboard-subtitle">View and manage all subjects</p>
        </header> */}

        <div className="action-and-filter-bar" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/admin/subjects/add" className="form-button" style={{ minWidth: '120px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
              Add Subject
            </Link>
          </div>

          {/* Filter and Sort Controls Container */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px'
          }}>
            {/* Filter Controls */}
            <div className="filter-controls" style={{ 
              padding: '15px', 
              border: '1px solid var(--border, #ddd)', 
              borderRadius: '8px', 
              backgroundColor: 'var(--surface, #f8f9fa)' 
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '1.1em', 
                color: 'var(--text-heading, var(--text))',
                fontWeight: '600'
              }}>
                Filter By:
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px', 
                alignItems: 'center' 
              }}>
                {/* Course Type Filter */}
                <select 
                  name="courseType" 
                  value={filters.courseType} 
                  onChange={handleFilterChange} 
                  className="filter-select"
                  style={{ minWidth: '180px' }}
                >
                  <option value="">All Course Types</option>
                  {uniqueCourseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange} 
                  className="filter-select"
                  style={{ minWidth: '150px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                {/* Lecture Hours Filter */}
                <select 
                  name="lectureHours" 
                  value={filters.lectureHours} 
                  onChange={handleFilterChange} 
                  className="filter-select"
                  style={{ minWidth: '170px' }}
                >
                  <option value="">All Lecture Hours</option>
                  {uniqueLectureHours.map(hours => (
                    <option key={hours} value={hours}>{hours}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="filter-controls" style={{ 
              padding: '15px', 
              border: '1px solid var(--border, #ddd)', 
              borderRadius: '8px', 
              backgroundColor: 'var(--surface, #f8f9fa)' 
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '1.1em', 
                color: 'var(--text-heading, var(--text))',
                fontWeight: '600'
              }}>
                Sort By:
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <select 
                    name="sortField" 
                    value={sortBy.field} 
                    onChange={handleSortChange} 
                    className="filter-select"
                    style={{ minWidth: '170px' }}
                  >
                    <option value="">No Sort</option>
                    <option value="name">Name</option>
                    <option value="code">Code</option>
                    <option value="courseType">Course Type</option>
                    <option value="lectureHours">Lecture Hours</option>
                  </select>

                  <select 
                    name="sortOrder" 
                    value={sortBy.order} 
                    onChange={handleSortChange} 
                    className="filter-select"
                    style={{ minWidth: '150px' }}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                
                <button 
                  onClick={clearFiltersAndSort} 
                  className="login-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--primary, #6366f1)',
                    color: 'var(--text-light, white)',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark, #4f46e5)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary, #6366f1)'}
                >
                  Clear Filters & Sort
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message" style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading...</div>
        ) : filteredAndSortedSubjects.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>No subjects found matching your criteria.</div>
        ) : (
          <div className="cards-grid">
            {filteredAndSortedSubjects.map((subject) => (
              <SubjectCard
                key={subject.code}
                subject={subject}
                onDelete={handleDeleteSubject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SubjectsPage;