import React from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 

import AddClassPage from './pages/class/AddClassPage'; 
import ClassesPage from './pages/class/ClassesPage'; 
import ModifyClassPage from './pages/class/ModifyClassPage';
import SearchClass from './pages/class/SearchClass';

import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminLogin from './pages/admin/AdminLogin'; 
import AdminStudentAttendece from './pages/admin/AdminStudentAttendance';
import AdminTeacherAttendance from './pages/admin/AdminTeacherAttendance';

import TeacherLogin from './pages/teacher/TeacherLogin'; 
import TeacherDashboard from './pages/teacher/TeacherDashboard'; 
import TeacherChangePassword from './pages/teacher/TeacherChangePassword'; 
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage'; 
import TeacherGradesPage from './pages/teacher/TeacherGradesPage'; 
import TeacherTimetable from './pages/teacher/TeacherTimetable'; 
import TeacherAttendanceHistory from './pages/teacher/TeacherAttendanceHistory'; 
import TeacherSettings from './pages/teacher/TeacherSettings'; 

import TeacherRegister from './pages/teacher/TeacherRegister'; 
import TeachersPage from './pages/teacher/TeachersPage'; 
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage'; 
import ModifyTeacherPage from './pages/teacher/ModifyTeacherPage'; 
import MarkTeacherAttendance from './pages/teacher/MarkTeacherAttendance'; 
import SearchTeacher from './pages/teacher/SearchTeacher';

import StudentLogin from './pages/student/StudentLogin'; 
import StudentDashboard from './pages/student/StudentDashboard'; 
import StudentRegister from './pages/student/StudentRegister'; 
import StudentsPage from './pages/student/StudentsPage'; 
import ModifyStudentPage from './pages/student/ModifyStudentPage'; 
import StudentTimetable from './pages/student/StudentTimetable'; 
import MarkStudentAttendance from './pages/student/MarkStudentAttendance'; 
import StudentAttendanceHistory from './pages/student/StudentAttendanceHistory'; 
import StudentSettings from './pages/student/StudentSettings';
import TakeStudentAttendancePage from './pages/student/TakeStudentAttendancePage';

import SubjectsPage from './pages/subject/SubjectsPage'; 
import AddSubjectPage from './pages/subject/AddSubjectPage'; 
import UpdateSubjectPage from './pages/subject/UpdateSubjectPage'; 
import SearchSubjectPage from './pages/subject/SearchSubjectPage'; 
import DeleteSubjectPage from './pages/subject/DeleteSubjectPage'; 

import Index from './pages/other/IndexPage'; 
import DepartmentsPage from './pages/other/DepartmentsPage'; 
import SettingsPage from './pages/other/SettingsPage'; 
import { AuthProvider } from './context/AuthContext'; 

import MappedPage from './pages/attendence/Mapped';
import GenerateTimetablePage from './pages/timetable/GenerateTimetablePage';
import AdminTimetablePdfGenerator from './pages/admin/AdminTimetablePdfGenerator';
import CreateTimetablePage from './pages/timetable/CreateTimetablePage';
import ViewClassMappingsPage from './pages/timetable/ViewClassMappingsPage';

//import { ProtectedRoute } from './components/ProtectedRoute';


import './App.css';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

function AppContent() {
  return (
    <Router>
      <AuthProvider>
        <ThemeToggleButton />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />

          {/* Direct access without ProtectedRoute */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          <Route path="/admin/teachers/register" element={<TeacherRegister />} />
          <Route path="/admin/students/register" element={<StudentRegister />} />

          <Route path="/admin/classes" element={<ClassesPage />} />
          <Route path="/admin/classes/add" element={<AddClassPage />} />
          <Route path="/admin/classes/modify" element={<ModifyClassPage />} />
          <Route path="/admin/classes/modify/:c_id" element={<ModifyClassPage />} />
          <Route path="/admin/classes/search" element={<SearchClass />} />

          <Route path="/admin/teachers" element={<TeachersPage />} />
          <Route path="/admin/teachers/modify" element={<ModifyTeacherPage />} />
          <Route path="/admin/teachers/search" element={<SearchTeacher />} />
          <Route path="/admin/teachers/attendance" element={<MarkTeacherAttendance />} />

          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/students/modify" element={<ModifyStudentPage />} />
          <Route path="/admin/students/attendance" element={<MarkStudentAttendance />} />

          <Route path="/admin/departments" element={<DepartmentsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          <Route path="/teacher/changepassword" element={<TeacherChangePassword />} />
          <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
          <Route path="/teacher/grades" element={<TeacherGradesPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/timetable" element={<TeacherTimetable />} />
          <Route path="/teacher/attendance/history" element={<TeacherAttendanceHistory />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          <Route path="/teacher/studentattendance" element={<TakeStudentAttendancePage />} />

          <Route path="/student/timetable" element={<StudentTimetable />} />
          <Route path="/student/attendance/history" element={<StudentAttendanceHistory />} />
          <Route path="/student/settings" element={<StudentSettings />} />

          <Route path="/admin/subjects" element={<SubjectsPage />} />
          <Route path="/admin/subjects/add" element={<AddSubjectPage />} />
          <Route path="/admin/subjects/updatesubject/:subjectCode" element={<UpdateSubjectPage />} />
          {/* <Route path="/admin/subjects/update" element={<UpdateSubjectPage />} /> */}
          <Route path="/admin/subjects/search" element={<SearchSubjectPage />} />
          <Route path="/admin/subjects/delete" element={<DeleteSubjectPage />} />

          <Route path="/admin/adminstudentattendance" element={<AdminStudentAttendece />} />
          <Route path="/admin/adminteacherattendance" element={<AdminTeacherAttendance />} />

          <Route path="/admin/mapped" element={<MappedPage />} />
          <Route path="/admin/generatetimetable" element={<GenerateTimetablePage />} />
          <Route path="/admin/timetable-pdf" element={<AdminTimetablePdfGenerator />} />
          <Route path="/admin/timetable/create" element={<CreateTimetablePage />} />
          <Route path="/admin/timetable/view-mappings" element={<ViewClassMappingsPage />} />

          {/* <Route path="*" element={<Navigate to="/" />} />  */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}