import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import '../../styles/Dashboard.css';
import { useAuth } from '../../context/AuthContext';

function GetTeacherSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchTeacherSchedule = async () => {
    if (!user?._id) {
      setError('User ID not found. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Assuming this endpoint returns a full schedule for the class,
      // and we need to filter for the teacher on the frontend.
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/teacher/schedule/${user._id}`,
        { withCredentials: true }
      );
      console.log('Teacher schedule:', response.data.data);
      setSchedule(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teacher schedule:', err);
      setError('Failed to fetch your schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherSchedule();
  }, [user?._id, API_BASE_URL]);

  const renderSchedule = () => {
    if (loading) {
      return <p>Loading schedule...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (schedule.length === 0) {
      return <p>No schedule found.</p>;
    }

    const periods = schedule[0]?.periods.map(p => p.period.period) || [];

    return (
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Day</th>
              {periods.map((period, index) => (
                <th key={index}>{period}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((dayEntry, dayIndex) => (
              <tr key={dayIndex}>
                <td>{dayEntry.day}</td>
                {dayEntry.periods.map((periodEntry, periodIndex) => (
                  <td key={periodIndex}>
                    {/* New condition: Check if the mapped teacher's ID matches the current user's ID */}
                    {periodEntry.mapped?.teacherId?._id === user._id ? (
                      <>
                        <div className="subject-name">{periodEntry.mapped.subjectId.subjectName}</div>
                        <div className="class-id">({dayEntry.classId?.classId})</div>
                      </>
                    ) : (
                      <div className="empty-slot">-</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="My Schedule" />
        <button onClick={fetchTeacherSchedule}>Refresh Schedule</button>
        <div className="schedule-section">
          <h2>My Schedule</h2>
          {renderSchedule()}
        </div>
      </main>
    </div>
  );
}

export default GetTeacherSchedule;