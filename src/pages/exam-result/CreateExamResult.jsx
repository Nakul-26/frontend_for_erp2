// CreateExamResult.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

function CreateExamResult() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marksObtained, setMarksObtained] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/exam/getall`, { withCredentials: true })
      .then(res => setExams(res.data.data || []));

    axios.get(`${API}/api/v1/admin/getallclassformapped`, { withCredentials: true })
      .then(res => setClasses(res.data.data || []));

    axios.get(`${API}/api/v1/admin/getall`, { withCredentials: true })
      .then(res => {
        setSubjects(res.data.subjects);
        console.log('Subjects fetched:', res.data.subjects);
      });
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    axios.get(`${API}/api/v1/admin/getallstudents/${selectedClass}`, { withCredentials: true })
      .then(res => setStudents(res.data.data || []));
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedExam) return;
    axios.get(`${API}/api/v1/admin/exam/${selectedExam}`, { withCredentials: true })
      .then(res => {
        const subjectsArr = res.data.data.subjects || [];
        setMarksObtained(subjectsArr.map(s => ({
          subjectId: s.subjectId._id || s.subjectId,
          marks: 0,
          status: "Present"
        })));
      });
  }, [selectedExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/v1/admin/examresult/create`, {
        examId: selectedExam,
        studentId: selectedStudent,
        marksObtained
      }, { withCredentials: true });
      alert('Exam result created!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating result');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="form-container">
          <h2>Create Exam Result</h2>
          <form onSubmit={handleSubmit}>
            <select required value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name || c.className}</option>)}
            </select>

            <select required value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
            </select>

            <select required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            {marksObtained.map((m, i) => {
              const subj = subjects.find(s => s._id === m.subjectId);
              return (
                <div key={i}>
                  <label>
                    Subject: {subj ? `${subj.name} (${subj.code})` : m.subjectId}
                  </label>
                  <input type="number" value={m.marks} onChange={e => {
                    const updated = [...marksObtained];
                    updated[i].marks = Number(e.target.value);
                    setMarksObtained(updated);
                  }} />
                  <select value={m.status} onChange={e => {
                    const updated = [...marksObtained];
                    updated[i].status = e.target.value;
                    setMarksObtained(updated);
                  }}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              );
            })}

            <button type="submit">Submit</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateExamResult;
