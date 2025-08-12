import React, { lazy, Suspense, useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const Sidebar = lazy(() => import('../../components/Sidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function NotesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notes, setNotes] = useState([]); // Empty array for notes
  
  // Form states
  const [noteName, setNoteName] = useState('');
  const [noteLink, setNoteLink] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      if (!API_BASE_URL) {
        setError('Server configuration error: API URL missing.');
        return;
      }

      setLoading(true);
      try {
        const classesResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/getallclass`, {
          withCredentials: true
        });

        if (classesResponse.data.success && Array.isArray(classesResponse.data.data)) {
          setClasses(classesResponse.data.data);
        } else {
          setError('Invalid response format from server');
        }
      } catch (err) {
        setError('Unable to fetch classes. Please check your connection.');
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteName || !noteLink || selectedClasses.length === 0) {
      setError('Please fill all fields and select at least one class');
      return;
    }

    setError('');
    const noteData = {
      name: noteName,
      link: noteLink,
      classes: selectedClasses,
      uploadDate: new Date().toISOString(),
      status: 'active'
    };

    console.log('Note data (Backend pending):', noteData);
    setSuccess('Note registered successfully! (Backend integration pending)');
    
    // Reset form
    setNoteName('');
    setNoteLink('');
    setSelectedClasses([]);
  };

  // Handle class selection
  const handleClassSelection = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <Navbar pageTitle={"Study Notes"} role="admin"/>
          <div className="notes-container" style={{ padding: '20px' }}>
            {/* Coming Soon Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              padding: '16px 24px',
              borderRadius: '12px',
              marginBottom: '24px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>🚧Coming Soon!</h2>
              <p style={{ opacity: 0.9 }}>
                The notes feature is currently in development. You can test the interface, but data won't be saved.
              </p>
            </div>
            
            {/* Add Note Form */}
            <div className="add-note-form" style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px',
              boxShadow: '0 2px 4px var(--border-color)'
            }}>
              <h2 style={{ marginBottom: '20px', color: 'var(--text)' }}>Add New Note</h2>
              
              {error && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca'
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0'
                }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Note Name Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text)',
                    fontWeight: '500'
                  }}>
                    Note Name
                  </label>
                  <input
                    type="text"
                    value={noteName}
                    onChange={(e) => setNoteName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text)'
                    }}
                    placeholder="Enter note name"
                    required
                  />
                </div>

                {/* Note Link Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text)',
                    fontWeight: '500'
                  }}>
                    Note Link
                  </label>
                  <input
                    type="url"
                    value={noteLink}
                    onChange={(e) => setNoteLink(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text)'
                    }}
                    placeholder="Enter note link"
                    required
                  />
                </div>

                {/* Class Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text)',
                    fontWeight: '500'
                  }}>
                    Select Classes
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {loading ? (
                      <div style={{ color: 'var(--text-muted)' }}>Loading classes...</div>
                    ) : classes.map(cls => (
                      <label
                        key={cls.classId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: selectedClasses.includes(cls.classId) ? 'var(--primary-light)' : 'var(--surface)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls.classId)}
                          onChange={() => handleClassSelection(cls.classId)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ color: 'var(--text)' }}>{cls.name} ({cls.section})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Adding...' : 'Add Note'}
                </button>
              </form>
            </div>

            {/* Preview of the upcoming interface */}
            {/* Notes List */}
            <div className="notes-list" style={{
              background: 'var(--surface)',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px var(--border-color)'
            }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Uploaded Notes</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Note Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Link</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Classes</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Upload Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.length === 0 ? (
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td colSpan="5" style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: 'var(--text-muted)',
                          fontStyle: 'italic'
                        }}>
                          No notes added yet. Add your first note using the form above!
                        </td>
                      </tr>
                    ) : (
                      notes.map((note, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px' }}>{note.name}</td>
                          <td style={{ padding: '12px' }}>
                            <a 
                              href={note.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary)' }}
                            >
                              View Note
                            </a>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {note.classes.map(classId => 
                              classes.find(c => c.classId === classId)?.name
                            ).join(', ')}
                          </td>
                          <td style={{ padding: '12px' }}>{new Date(note.uploadDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>
                            <button
                              style={{
                                padding: '6px 12px',
                                background: 'var(--danger)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                console.log('Delete functionality pending backend integration');
                                setSuccess('Delete functionality will be available with backend integration');
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

export default NotesPage;
