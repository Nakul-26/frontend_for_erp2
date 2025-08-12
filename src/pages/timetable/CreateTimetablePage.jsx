import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/CreateTimetablePage.css';
import '../../styles/TimetableDarkMode.css';

// Define responsive styles for the component
const responsiveStyles = {
  mobile: `
    @media (max-width: 640px) {
      .timetable-controls {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .drag-container {
        margin-bottom: 16px !important;
        padding: 8px !important;
      }
      .drag-item {
        font-size: 0.875rem !important;
        padding: 8px 12px !important;
        margin: 4px !important;
      }
      .class-select-container {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .class-select-container select {
        width: 100% !important;
      }
      /* Mobile styles for quick fill section */
      .quick-fill-container {
        flex-direction: column !important;
      }
      .quick-fill-item {
        width: 100% !important;
      }
      .timetable-mobile-layout {
        display: flex !important;
        flex-direction: column !important;
      }
      .timetable-mobile-layout thead {
        display: none !important;
      }
      .timetable-mobile-layout tbody tr {
        display: flex !important;
        flex-direction: column !important;
        margin-bottom: 16px !important;
      }
      .timetable-mobile-layout td {
        display: flex !important;
        flex-direction: row !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .timetable-mobile-layout td:first-child {
        background-color: var(--primary) !important;
        color: var(--text-light) !important;
        font-weight: bold !important;
        justify-content: center !important;
        padding: 12px !important;
        position: static !important;
      }
      .timetable-mobile-layout td:not(:first-child)::before {
        content: attr(data-time);
        min-width: 80px !important;
        font-weight: bold;
        margin-right: 8px;
      }
    }
  `,
  tablet: `
    @media (max-width: 1024px) {
      .timetable-table-wrapper {
        margin-top: 16px !important;
      }
      .timetable-table:not(.timetable-mobile-layout) th, 
      .timetable-table:not(.timetable-mobile-layout) td {
        padding: 8px 6px !important;
      }
      .timetable-controls {
        gap: 12px !important;
      }
    }
  `,
  darkMode: `
    [data-theme="dark"] .timetable-form-container {
      background-color: #1f2937 !important;
      border-color: #374151 !important;
    }
    [data-theme="dark"] .drag-container {
      background-color: #111827 !important;
      border-color: #374151 !important;
    }
    [data-theme="dark"] .drag-item {
      background-color: #1f2937 !important;
      border-color: #6366f1 !important;
      color: #e5e7eb !important;
    }
    [data-theme="dark"] .drag-item:hover {
      background-color: #2d3748 !important;
    }
    [data-theme="dark"] .timetable-table {
      border-color: #374151 !important;
    }
    [data-theme="dark"] .timetable-table th {
      background-color: #4f46e5 !important;
    }
    [data-theme="dark"] .timetable-table td {
      border-color: #374151 !important;
      background-color: #1f2937 !important;
      color: #e5e7eb !important;
    }
    [data-theme="dark"] .timetable-table td:nth-child(1) {
      background-color: #111827 !important;
    }
    [data-theme="dark"] select, [data-theme="dark"] button {
      background-color: #374151 !important;
      border-color: #4b5563 !important;
      color: #e5e7eb !important;
    }
    [data-theme="dark"] select option {
      background-color: #1f2937 !important;
    }
    [data-theme="dark"] .status-message {
      background-color: #1f2937 !important;
    }
  `
};

function CreateTimetablePage({ isEditMode = false }) {
  const navigate = useNavigate(); // Add navigation hook
  const { classId: urlClassId } = useParams();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [mappedPairs, setMappedPairs] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [timeSlots, setTimeSlots] = useState([]);
  // ...existing code...
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Function to check API health
  const checkApiHealth = async () => {
    try {
      const healthEndpoint = `${API_BASE_URL}/api/v1/admin/health`;
      console.log(`Checking API health: ${healthEndpoint}`);
      await axios.get(healthEndpoint, { 
        withCredentials: true,
        timeout: 5000
      });
      console.log('API is available');
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Log that component is mounting with relevant props
    console.log(`CreateTimetablePage mounting - Edit Mode: ${isEditMode}, ClassID: ${urlClassId || 'none'}`);
    
    // Check if API_BASE_URL is defined
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined! Check your .env file for VITE_API_URL');
      return;
    }
    
    // Check API health on component mount
    checkApiHealth().then(isHealthy => {
      if (!isHealthy) {
        console.warn('API seems to be unavailable. Please check your backend server.');
      }
    });
    
    // Load initial data
    const initializeData = async () => {
      try {
        await Promise.all([fetchClasses(), fetchTimeSlots()]);
        console.log('Initial data loaded: classes and time slots');
        
        // If in edit mode and we have a classId from URL, select that class and load its data
        if (isEditMode && urlClassId) {
          console.log(`Edit mode active with class ID: ${urlClassId}`);
          setSelectedClass(urlClassId);
          
          // We need to make sure we have the classes and time slots before loading data
          try {
            await fetchSubjectsAndTeachers(urlClassId);
            await loadExistingTimetable(urlClassId);
          } catch (err) {
            console.error('Error loading edit data:', err);
            setError(`Failed to load timetable data: ${err.message}`);
          }
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to initialize page data. Please refresh and try again.');
      }
    };
    
    initializeData();
  }, [isEditMode, urlClassId, API_BASE_URL]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclassformapped`, { withCredentials: true });
      // console.log('Classes fetched:', res.data.data);
      setClasses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/getallslots`, { withCredentials: true });
      // console.log('Time slots fetched:', res.data);
      setTimeSlots(res.data || []);
    } catch (err) {
      console.error('Failed to fetch time slots:', err);
    }
  };

  const fetchSubjectsAndTeachers = async (classId) => {
    try {
      const mappingRes = await axios.get(`${API_BASE_URL}/api/v1/admin/getClassMappings/${classId}`, { withCredentials: true });
      const pairs = mappingRes.data.data || [];
      // Extract unique subjects and teachers from pairs
      const subjectsMap = {};
      const teachersMap = {};
      pairs.forEach(m => {
        const subj = typeof m.subjectId === 'object' ? m.subjectId : null;
        const teach = typeof m.teacherId === 'object' ? m.teacherId : null;
        if (subj && subj._id) subjectsMap[subj._id] = subj;
        if (teach && teach._id) teachersMap[teach._id] = teach;
      });
      const uniqueSubjects = Object.values(subjectsMap);
      const uniqueTeachers = Object.values(teachersMap);
      // console.log('Subjects fetched:', uniqueSubjects);
      // console.log('Teachers fetched:', uniqueTeachers);
      // console.log('Mapped pairs fetched:', pairs);
      setSubjects(uniqueSubjects);
      setTeachers(uniqueTeachers);
      setMappedPairs(pairs);
    } catch (err) {
      console.error('Failed to fetch subjects, teachers, or mappings:', err);
      console.error(err);
    }
  };

  const handleClassChange = async (e) => {
    try {
      const classId = e.target.value;
      setSelectedClass(classId);
      setGrid({});
      setError('');
      
      if (classId) {
        console.log(`Class changed to: ${classId}`);
        await fetchSubjectsAndTeachers(classId);
        
        // If in edit mode, load existing timetable when changing class
        if (isEditMode) {
          console.log('Edit mode active, loading existing timetable');
          await loadExistingTimetable(classId);
        }
      }
    } catch (err) {
      console.error('Error in handleClassChange:', err);
      setLoading(false);
    }
  };

  const handleGridChange = (day, slotId, field, value) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: {
          ...((prev[day] && prev[day][slotId]) || {}),
          [field]: value
        }
      }
    }));
  };

  // Fill all for a day
  const handleFillAllDay = (day, mappedId) => {
    const found = mappedPairs.find(m => m._id === mappedId);
    if (!found) return;
    setGrid(prev => {
      const newDay = {};
      timeSlots.forEach(slot => {
        if (!isBreakPeriod(slot.period)) {
          const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
          const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
          const subjectId = mSubject ? mSubject._id : found.subjectId;
          const teacherId = mTeacher ? mTeacher._id : found.teacherId;
          newDay[slot._id] = {
            combo: mappedId,
            subject: subjectId,
            teacher: teacherId
          };
        }
      });
      return {
        ...prev,
        [day]: newDay
      };
    });
  };

  // Drag and drop handlers
  const [draggedPair, setDraggedPair] = useState(null);
  const handleDragStart = (pairId) => setDraggedPair(pairId);
  const handleDrop = (day, slotId) => {
    if (draggedPair) {
      const found = mappedPairs.find(m => m._id === draggedPair);
      if (found) {
        const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
        const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
        const subjectId = mSubject ? mSubject._id : found.subjectId;
        const teacherId = mTeacher ? mTeacher._id : found.teacherId;
        handleGridChange(day, slotId, 'combo', draggedPair);
        handleGridChange(day, slotId, 'subject', subjectId);
        handleGridChange(day, slotId, 'teacher', teacherId);
      }
    }
    setDraggedPair(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Strict validation: ensure every non-break period has a valid mappedId
    for (const day of days) {
      for (const slot of timeSlots) {
        if (!isBreakPeriod(slot.period)) {
          const cell = grid[day]?.[slot._id] || {};
          if (!cell.combo) {
            setLoading(false);
            alert(`Please select a subject-teacher pair for ${day}, ${slot.period}`);
            return;
          }
          const found = mappedPairs.find(m => m._id === cell.combo);
          if (!found || !found._id) {
            setLoading(false);
            alert(`Invalid mapping for ${day}, ${slot.period}. Please select a valid subject-teacher pair.`);
            return;
          }
        }
      }
    }

    try {
      // If we're in edit mode, first delete the entire timetable for this class
      if (isEditMode) {
        console.log(`Deleting entire timetable for class ${selectedClass} before updating`);
        try {
          await axios.delete(`${API_BASE_URL}/api/v1/admin/deletedailyschedule/${selectedClass}`, { 
            withCredentials: true,
            timeout: 10000 // 10 second timeout
          });
          console.log('Successfully deleted existing timetable');
        } catch (deleteError) {
          console.error('Error deleting existing timetable:', deleteError);
          // Continue anyway as the post requests should overwrite existing data
        }
      }
      
      // Send a separate request for each day
      for (const day of days) {
        const periods = timeSlots
          .filter(slot => !isBreakPeriod(slot.period))
          .map(slot => {
            const cell = grid[day]?.[slot._id] || {};
            let mappedId = '';
            if (cell.combo) {
              mappedId = cell.combo;
            }
            return {
              period: slot._id,
              mapped: mappedId
            };
          });
        
        console.log(`Creating timetable for day: ${day}`);
        const payload = {
          day,
          periods
        };
        
        // Create new entries for each day
        await axios.post(`${API_BASE_URL}/api/v1/admin/createdailyschedule/${selectedClass}`, payload, { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        });
        console.log(`Successfully created timetable for ${day}`);
      }
      
      // Redirect immediately after successful operation
      if (isEditMode) {
        // Navigate directly to the timetable list page after a successful update
        navigate('/admin/timetable/all');
      } else {
        // Just stop loading for create mode
        setLoading(false);
        // Show a quick toast-like alert
        alert(isEditMode ? 'Timetable updated successfully!' : 'Timetable created successfully!');
      }
    } catch (err) {
      console.error('Error saving timetable:', err);
      
      // Show a simple alert for errors
      alert(`Failed to ${isEditMode ? 'update' : 'create'} timetable. Please try again.`);
      
      setLoading(false);
    }
  };

  const isBreakPeriod = (periodName) => periodName.toLowerCase().includes('break');
  
  // Function to load existing timetable for editing
  const loadExistingTimetable = async (classId) => {
    if (!classId) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log(`Loading timetable for class ${classId}`);
      let timetables = [];
      
      // Try multiple endpoints in sequence to find one that works
      const endpoints = [
        // Try the daily schedules endpoint (seems most reliable from other files)
        {
          url: `${API_BASE_URL}/api/v1/admin/getclassdailyschedule/${classId}`,
          name: "Class daily schedule endpoint"
        },
        // Try the get all daily schedules endpoint
        {
          url: `${API_BASE_URL}/api/v1/admin/getalldailyschedules/${classId}`,
          name: "All daily schedules endpoint"
        },
        // Try the standard endpoint from classes API
        {
          url: `${API_BASE_URL}/api/v1/admin/classes/${classId}/timetable`,
          name: "Class-specific timetable endpoint"
        },
        // Try the endpoint used in CreateTimetablePage
        {
          url: `${API_BASE_URL}/api/v1/admin/getClassTimetable/${classId}`,
          name: "Class timetable endpoint"
        },
        // Try plain class details endpoint which might include timetable
        {
          url: `${API_BASE_URL}/api/v1/admin/getclassdetail/${classId}`,
          name: "Class details endpoint"
        }
      ];
      
      let success = false;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting to fetch from: ${endpoint.name} - ${endpoint.url}`);
          
          const response = await axios.get(endpoint.url, { 
            withCredentials: true,
            timeout: 15000 // 15 second timeout
          });
          
          console.log(`${endpoint.name} response:`, response.data);
          
          if (response.data && response.data.data) {
            // Check if the data format is what we expect
            const data = response.data.data;
            if (Array.isArray(data) && data.length > 0 && data[0].day && data[0].periods) {
              timetables = data;
              success = true;
              console.log(`Successfully loaded timetable using ${endpoint.name}`);
              break;
            } else if (data.timetable || data.dailySchedules) {
              // Handle nested timetable data
              const timetableData = data.timetable || data.dailySchedules;
              timetables = Array.isArray(timetableData) ? timetableData : [timetableData];
              success = true;
              console.log(`Successfully loaded nested timetable data using ${endpoint.name}`);
              break;
            } else if (Array.isArray(data)) {
              console.log(`Found array data from ${endpoint.name}, checking format...`);
              // Try to adapt the data format
              const adaptedData = data.map(item => {
                // Check if this item has necessary timetable structure
                if (item.day && (item.periods || item.slots)) {
                  return {
                    day: item.day,
                    periods: item.periods || item.slots || []
                  };
                }
                return item;
              });
              
              if (adaptedData.some(item => item.day && item.periods)) {
                timetables = adaptedData;
                success = true;
                console.log(`Successfully adapted array data from ${endpoint.name}`);
                break;
              }
            }
          } else if (response.data) {
            // Try to adapt the response format if needed
            if (Array.isArray(response.data) && response.data.length > 0) {
              if (response.data[0].day) {
                timetables = response.data;
                success = true;
                console.log(`Using direct array data format from ${endpoint.name}:`, timetables);
                break;
              }
            } else if (typeof response.data === 'object') {
              // Try to extract timetable data from response
              const possibleData = response.data.timetable || 
                                 response.data.dailySchedules || 
                                 response.data.schedules ||
                                 response.data;
              
              if (possibleData) {
                timetables = Array.isArray(possibleData) ? possibleData : [possibleData];
                success = true;
                console.log(`Extracted timetable data from ${endpoint.name}:`, timetables);
                break;
              }
            }
          }
        } catch (err) {
          console.error(`Error with ${endpoint.name}:`, err);
          lastError = err;
          // Continue to the next endpoint
        }
      }
      
      if (!success) {
        throw lastError || new Error('All endpoints failed to return valid timetable data');
      }
      
      // Process the retrieved timetables
      if (timetables.length > 0) {
        // Initialize grid with existing data
        const newGrid = {};
        
        // Process each day's timetable
        timetables.forEach(daySchedule => {
          // Handle different response formats
          const day = daySchedule.day || daySchedule.dayOfWeek || daySchedule.name;
          if (!day) {
            console.warn('Skipping timetable entry without day information:', daySchedule);
            return;
          }
          
          if (!newGrid[day]) {
            newGrid[day] = {};
          }
          
          // Handle different formats for periods/slots
          const periods = daySchedule.periods || daySchedule.slots || daySchedule.schedule || [];
          
          // Process each period in this day
          periods.forEach(period => {
            try {
              // Handle different period structures
              const periodObj = period.period || period;
              const slotId = periodObj._id || period._id || (period.slotId?._id || period.slotId);
              
              if (!slotId) {
                console.warn('Skipping period without valid ID:', period);
                return;
              }
              
              // Get period name to check for breaks
              const periodName = periodObj.period || periodObj.name || '';
              
              // Skip break periods
              if (isBreakPeriod(periodName)) return;
              
              // Initialize this cell if not already
              if (!newGrid[day][slotId]) {
                newGrid[day][slotId] = {};
              }
              
              // Handle different mappings for subject/teacher info
              let mappedData = period.mapped || period.subject || period.classDetails || period;
              
              if (mappedData) {
                // Extract mapped ID
                const mappedId = mappedData._id || '';
                
                // Extract subject and teacher IDs
                let subjectId = null;
                let teacherId = null;
                
                // Try different property paths to find subject and teacher
                if (mappedData.subjectId) {
                  subjectId = mappedData.subjectId._id || mappedData.subjectId;
                } else if (mappedData.subject) {
                  subjectId = mappedData.subject._id || mappedData.subject;
                }
                
                if (mappedData.teacherId) {
                  teacherId = mappedData.teacherId._id || mappedData.teacherId;
                } else if (mappedData.teacher) {
                  teacherId = mappedData.teacher._id || mappedData.teacher;
                }
                
                // Only set if we have at least one of subject or teacher
                if (subjectId || teacherId) {
                  newGrid[day][slotId] = {
                    combo: mappedId,
                    subject: subjectId,
                    teacher: teacherId
                  };
                }
              }
            } catch (err) {
              console.error('Error processing period:', err, period);
              // Continue with next period
            }
          });
        });
        
        // Update grid state with loaded data
        console.log('Loaded timetable data:', newGrid);
        
        // Check if we have any actual data
        const hasData = Object.keys(newGrid).some(day => 
          Object.keys(newGrid[day]).length > 0
        );
        
        if (hasData) {
          setGrid(newGrid);
          console.log('Timetable loaded for editing');
        } else {
          console.log('Timetable structure loaded, but no subject/teacher mappings found');
        }
      } else {
        if (isEditMode) {
          console.log('No existing timetable found. Create a new one for this class.');
        }
      }
    } catch (err) {
      console.error('Error loading timetable:', err);
      
      // In edit mode, show a brief alert but allow continuing with an empty timetable
      if (isEditMode) {
        console.log('Starting with an empty timetable due to load error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <style>{responsiveStyles.mobile}</style>
      <style>{responsiveStyles.tablet}</style>
      <style>{responsiveStyles.darkMode}</style>
      <Sidebar />
      <main className="main-content" style={{ 
        fontSize: '16px',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--background)',
        color: 'var(--text)'
      }}>
        <Navbar pageTitle={isEditMode ? "Edit Timetable" : "Create Timetable"} />
        <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0', overflowX: 'hidden' }}>
          <div className="timetable-form-container" style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px',
            margin: '0 auto',
            border: '1px solid var(--border-color, #e5e7eb)',
            color: 'var(--text, #333333)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Simple loading indicator that shows only during loading state */}
              {loading && (
                <div className="loading-indicator" style={{ 
                  position: 'fixed',
                  top: '60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  backgroundColor: 'rgba(99, 102, 241, 0.9)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="loading-spinner" style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  {isEditMode ? 'Updating timetable...' : 'Loading...'}
                </div>
              )}
              
              {isEditMode && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '12px 16px',
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '1px solid #bae6fd',
                  color: '#0369a1'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    fontWeight: 600
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit Mode
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    You are currently editing the timetable for the selected class. Make your changes and click "Update Timetable" to save.
                  </p>
                </div>
              )}

              <div className="class-select-container" style={{ 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <label htmlFor="class-select" style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--text, #333)'
                }}>{isEditMode ? 'Editing Timetable for:' : 'Select Class:'}</label>
                <select 
                  id="class-select" 
                  value={selectedClass} 
                  onChange={handleClassChange}
                  disabled={isEditMode && urlClassId}
                  required
                  style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--input-background, white)',
                    color: 'var(--input-text, #333)',
                    minWidth: '200px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                  }}
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name || cls.className}</option>
                  ))}
                </select>
              </div>

              {selectedClass && timeSlots.length > 0 && (
                <div>
                  {/* Drag-and-drop source list */}
                  <div className="timetable-controls" style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginBottom: '24px'
                  }}>
                    <div className="drag-container" style={{ 
                      flex: '1',
                      background: 'var(--surface-alt, #f9fafb)',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid var(--border-color, #e5e7eb)'
                    }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: '#333'
                      }}>Subject-Teacher Pairs:</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {mappedPairs.map(m => {
                          const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                          const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                          const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || mSubject._id) : m.subjectId;
                          const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || mTeacher._id) : m.teacherId;
                          return (
                            <div
                              key={m._id}
                              draggable
                              onDragStart={() => handleDragStart(m._id)}
                              className="drag-item"
                              style={{
                                padding: '10px 16px',
                                background: 'var(--surface, #ffffff)',
                                color: 'var(--text, #333)',
                                borderRadius: '6px',
                                cursor: 'grab',
                                border: '1px solid var(--primary, #6366f1)',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                margin: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                userSelect: 'none'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#eef2ff';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--surface)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                              }}
                            >
                              <svg style={{ marginRight: '8px', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 11V17M18 14H12M6 7V13M6 10H12" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="3" y="3" width="6" height="6" rx="1" stroke="#6366f1" strokeWidth="2"/>
                                <rect x="15" y="15" width="6" height="6" rx="1" stroke="#6366f1" strokeWidth="2"/>
                              </svg>
                              {subjectName} - {teacherName}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ 
                        marginTop: '12px', 
                        fontSize: '0.875rem', 
                        color: '#6B7280', 
                        textAlign: 'center'
                      }}>
                        <em>Drag items to the timetable slots or use the dropdown selectors</em>
                      </div>
                    </div>
                  </div>
                  {/* Display a special layout for mobile devices */}
                  <div className="timetable-table-wrapper" style={{ 
                    overflowX: 'auto', 
                    width: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    marginTop: '8px'
                  }}>
                    <table className="timetable-table timetable-mobile-layout" style={{ 
                      tableLayout: 'fixed', 
                      minWidth: '100%', 
                      width: '100%', 
                      margin: '0 auto',
                      borderCollapse: 'collapse'
                    }}>
                      <colgroup>
                        <col style={{ width: '120px' }} />
                        {timeSlots.map((slot, idx) => (
                          <col key={slot._id} style={{ width: '1fr' }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--primary, #6366f1)' }}>
                          <th style={{ 
                            color: 'white',
                            padding: '12px 8px',
                            position: 'sticky',
                            left: 0,
                            top: 0,
                            zIndex: 2,
                            backgroundColor: '#6366f1',
                            borderRight: '1px solid #e5e7eb',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                          }}>Day / Time</th>
                          {timeSlots.map(slot => (
                            <th key={slot._id} style={{ 
                              color: 'white',
                              padding: '12px 8px',
                              textAlign: 'center',
                              fontWeight: '600',
                              fontSize: '0.95rem'
                            }}>
                              {slot.period}<br />
                              <small style={{ 
                                fontSize: '0.8rem', 
                                opacity: 0.9,
                                display: 'block', 
                                marginTop: '4px' 
                              }}>
                                {slot.startTime} - {slot.endTime}
                              </small>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {days.map(day => (
                          <tr key={day} style={{ 
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            <td style={{ 
                              padding: '12px 8px', 
                              fontWeight: '600', 
                              backgroundColor: '#f3f4f6',
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              borderRight: '1px solid #e5e7eb',
                              textAlign: 'center'
                            }}>{day}</td>
                            {timeSlots.map(slot => (
                              <td
                                key={slot._id}
                                data-time={`${slot.period} (${slot.startTime}-${slot.endTime})`}
                                onDragOver={e => e.preventDefault()}
                                onDrop={() => handleDrop(day, slot._id)}
                                style={{ 
                                  wordBreak: 'break-word',
                                  padding: '10px 8px', 
                                  fontSize: '0.95rem',
                                  border: '1px solid #e5e7eb',
                                  backgroundColor: isBreakPeriod(slot.period) ? '#f9fafb' : 'white'
                                }}
                              >
                                {isBreakPeriod(slot.period) ? (
                                  <em style={{ 
                                    color: '#6B7280', 
                                    fontStyle: 'italic',
                                    display: 'block',
                                    textAlign: 'center'
                                  }}>{slot.period}</em>
                                ) : (
                                  <>
                                    <div>
                                      <select
                                        value={grid[day]?.[slot._id]?.combo || ''}
                                        onChange={e => {
                                          const mappedId = e.target.value;
                                          if (!mappedId) {
                                            handleGridChange(day, slot._id, 'combo', '');
                                            handleGridChange(day, slot._id, 'subject', '');
                                            handleGridChange(day, slot._id, 'teacher', '');
                                            return;
                                          }
                                          const found = mappedPairs.find(m => m._id === mappedId);
                                          if (found) {
                                            const mSubject = typeof found.subjectId === 'object' ? found.subjectId : null;
                                            const mTeacher = typeof found.teacherId === 'object' ? found.teacherId : null;
                                            const subjectId = mSubject ? mSubject._id : found.subjectId;
                                            const teacherId = mTeacher ? mTeacher._id : found.teacherId;
                                            handleGridChange(day, slot._id, 'combo', mappedId);
                                            handleGridChange(day, slot._id, 'subject', subjectId);
                                            handleGridChange(day, slot._id, 'teacher', teacherId);
                                          }
                                        }}
                                        style={{ 
                                          fontSize: '0.95rem',
                                          width: '100%',
                                          padding: '8px',
                                          borderRadius: '4px',
                                          border: '1px solid var(--border-color, #e5e7eb)',
                                          backgroundColor: 'var(--input-background, white)',
                                          color: 'var(--input-text, #333)',
                                          appearance: 'none',
                                          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'right 8px center',
                                          backgroundSize: '16px',
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                      >
                                        <option value="">-- Subject & Teacher --</option>
                                        {mappedPairs.map(m => {
                                          const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                                          const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                                          const subjectId = mSubject ? mSubject._id : m.subjectId;
                                          const teacherId = mTeacher ? mTeacher._id : m.teacherId;
                                          const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || subjectId) : subjectId;
                                          const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || teacherId) : teacherId;
                                          return (
                                            <option key={m._id} value={m._id}>
                                              {subjectName} - {teacherName}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add day-wise fill all buttons */}
              {selectedClass && timeSlots.length > 0 && (
                <div style={{ 
                  marginTop: '24px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px', 
                  width: '100%'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'var(--text, #333)',
                    margin: '0 0 8px 0'
                  }}>Quick Fill Options</h3>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {days.map(day => (
                      <div key={`fill-${day}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--surface-alt, #f9fafb)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                      }}>
                        <span style={{ fontWeight: '600', marginRight: '4px' }}>{day}:</span>
                        <select
                          onChange={e => handleFillAllDay(day, e.target.value)}
                          defaultValue=""
                          style={{ 
                            fontSize: '0.875rem',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color, #e5e7eb)',
                            backgroundColor: 'var(--input-background, white)',
                            color: 'var(--input-text, #333)',
                            width: 'auto',
                            minWidth: '160px'
                          }}
                        >
                          <option value="">Fill All Slots</option>
                          {mappedPairs.map(m => {
                            const mSubject = typeof m.subjectId === 'object' ? m.subjectId : null;
                            const mTeacher = typeof m.teacherId === 'object' ? m.teacherId : null;
                            const subjectName = mSubject ? (mSubject.name || mSubject.code || mSubject.shortName || mSubject._id) : m.subjectId;
                            const teacherName = mTeacher ? (mTeacher.name || mTeacher.code || mTeacher.shortName || mTeacher._id) : m.teacherId;
                            return (
                              <option key={m._id} value={m._id}>
                                {subjectName} - {teacherName}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="submit" 
                  disabled={!selectedClass || loading}
                  style={{
                    backgroundColor: !selectedClass || loading ? '#a1a1aa' : 'var(--primary, #6366f1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: !selectedClass || loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (!(!selectedClass || loading)) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-dark, #4f46e5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(!selectedClass || loading)) {
                      e.currentTarget.style.backgroundColor = 'var(--primary, #6366f1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {isEditMode ? (
                      <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5C18.3284 2.5 19 3.17157 19 4C19 4.82843 18.3284 5.5 17.5 5.5M17.5 2.5C16.6716 2.5 16 3.17157 16 4C16 4.82843 16.6716 5.5 17.5 5.5M17.5 2.5L8 12L6 18L12 16L17.5 10.5M17.5 5.5L19 7L17.5 8.5" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2"/>
                      </>
                    )}
                  </svg>
                  {loading ? (
                    <>
                      <span className="loading-spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderRadius: '50%',
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                      }}></span>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEditMode ? 'Update Timetable' : 'Create Timetable'}
                    </>
                  )}
                </button>
                
                <style jsx>{`
                  @keyframes spin {
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateTimetablePage;
