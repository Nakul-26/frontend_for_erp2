import React from 'react';
import '../../styles/Dashboard.css';
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';

function TeacherSchedulePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mockTimetable = [
    { day: 'Monday', time: '09:00 AM', subject: 'Math', class: '10A', room: 'Room 101' },
    { day: 'Tuesday', time: '11:00 AM', subject: 'Science', class: '11B', room: 'Lab B' },
  ];

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar role="teacher" />
        <h2>Timetable</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {mockTimetable.map((entry, index) => (
              <tr key={index}>
                <td>{entry.day}</td>
                <td>{entry.time}</td>
                <td>{entry.subject}</td>
                <td>{entry.class}</td>
                <td>{entry.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default TeacherSchedulePage;