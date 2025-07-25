// src/pages/teacher/TakeStudentAttendancePage.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css'; // Assuming common styles are here or create a new Attendance.css

const TeacherSidebar = lazy(() => import('../../components/TeacherSidebar'));
const Navbar = lazy(() => import('../../components/Navbar'));

function TakeStudentAttendancePage() {
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'present', ... }
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { teacherData } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/v1/teacher/classes`, { withCredentials: true });
                if (response.data.success) {
                    setTeacherClasses(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch classes.');
                }
            } catch (err) {
                console.error('Fetch classes error:', err);
                setError('Failed to load classes. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [API_BASE_URL]);

    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            if (!selectedClassId || !attendanceDate) {
                setStudents([]);
                setAttendanceStatus({});
                return;
            }

            setLoading(true);
            setError('');
            try {
                // Fetch students for the selected class
                const studentsResponse = await axios.get(`${API_BASE_URL}/api/v1/teacher/class/${selectedClassId}/students`, { withCredentials: true });
                if (studentsResponse.data.success) {
                    setStudents(studentsResponse.data.data);

                    // Initialize attendance status to 'present' for all students
                    const initialAttendance = {};
                    studentsResponse.data.data.forEach(student => {
                        initialAttendance[student._id] = 'present';
                    });
                    setAttendanceStatus(initialAttendance);

                    // Check if attendance already exists for this class and date
                    const attendanceHistoryResponse = await axios.get(`${API_BASE_URL}/api/v1/teacher/attendance/${selectedClassId}/${attendanceDate}`, { withCredentials: true });
                    if (attendanceHistoryResponse.data.success && attendanceHistoryResponse.data.data) {
                        const existingAttendance = {};
                        attendanceHistoryResponse.data.data.records.forEach(record => {
                            existingAttendance[record.student._id] = record.status;
                        });
                        setAttendanceStatus(existingAttendance); // Override with existing data
                        setSuccess('Attendance for this date already exists and is loaded.');
                    } else {
                        setSuccess(''); // Clear success if no previous attendance found
                    }

                } else {
                    setError(studentsResponse.data.message || 'Failed to fetch students.');
                }
            } catch (err) {
                console.error('Fetch students/attendance error:', err);
                setError('Failed to load students or attendance data. Please try again.');
                setStudents([]); // Clear students on error
                setAttendanceStatus({}); // Clear attendance on error
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndAttendance();
    }, [selectedClassId, attendanceDate, API_BASE_URL]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceStatus(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmitAttendance = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedClassId) {
            setError('Please select a class.');
            setLoading(false);
            return;
        }
        if (students.length === 0) {
            setError('No students to mark attendance for.');
            setLoading(false);
            return;
        }

        const records = students.map(student => ({
            studentId: student._id,
            status: attendanceStatus[student._id] || 'absent' // Default to absent if somehow not set
        }));

        try {
            const payload = {
                classId: selectedClassId,
                date: new Date(attendanceDate).toISOString(), // Send as ISO string for backend
                records: records
            };

            const response = await axios.post(`${API_BASE_URL}/api/v1/teacher/attendance`, payload, { withCredentials: true });

            if (response.data.success) {
                setSuccess(response.data.message || 'Attendance recorded successfully!');
                // Optionally clear form or reset state if needed
            } else {
                setError(response.data.message || 'Failed to record attendance.');
            }
        } catch (err) {
            console.error('Submit attendance error:', err);
            if (err.response) {
                setError(err.response.data.message || 'An error occurred while submitting attendance.');
            } else {
                setError('Network error or unexpected error.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <div className="dashboard-container">
                <TeacherSidebar teacherData={teacherData} />
                <main className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
                    <Navbar role="teacher" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <header className="dashboard-header">
                        <h1>Take Class Attendance</h1>
                        <p className="dashboard-subtitle">Select a class and mark student attendance</p>
                    </header>

                    <div className="login-container" style={{ width: '700px', maxWidth: '90%' }}> {/* Reusing Login.css styling */}
                        <form className="login-form" onSubmit={handleSubmitAttendance}>
                            <div className="input-group">
                                <label htmlFor="attendanceDate">Date:</label>
                                <input
                                    type="date"
                                    id="attendanceDate"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="selectClass">Select Class:</label>
                                <select
                                    id="selectClass"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">-- Choose a Class --</option>
                                    {teacherClasses.map(cls => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name} - {cls.section} ({cls.classId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {loading && <p>Loading students...</p>}
                            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                            {success && <div className="success-message" style={{ color: 'green', textAlign: 'center' }}>{success}</div>}

                            {selectedClassId && students.length > 0 && (
                                <div className="attendance-list">
                                    <h3>Students in {teacherClasses.find(c => c._id === selectedClassId)?.name || ''}</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Full Name</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map(student => (
                                                <tr key={student._id}>
                                                    <td>{student.studentId}</td>
                                                    <td>{student.fullName}</td>
                                                    <td>
                                                        <select
                                                            value={attendanceStatus[student._id] || 'present'}
                                                            onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                                            disabled={loading}
                                                        >
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                            <option value="late">Late</option>
                                                            <option value="excused">Excused</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button type="submit" className="login-button" disabled={loading}>
                                        {loading ? 'Submitting...' : 'SUBMIT ATTENDANCE'}
                                    </button>
                                </div>
                            )}

                            {selectedClassId && !loading && students.length === 0 && !error && (
                                <p>No students found for this class.</p>
                            )}
                        </form>
                    </div>
                </main>
            </div>
        </Suspense>
    );
}

export default TakeStudentAttendancePage;