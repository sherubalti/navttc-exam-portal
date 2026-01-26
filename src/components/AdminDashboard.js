import React, { useState, useEffect } from 'react';
import { exportResultsToExcel, exportProjectsToExcel } from '../utils/exportToExcel';
import configSchedule from '../data/examSchedule';
import { getCurrentPKTTime, formatForDateTimeInput } from '../utils/timeUtility';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [examSchedule, setExamSchedule] = useState({
    startDate: '',
    endDate: '',
    duration: 60
  });

  useEffect(() => {
    // Load students
    const studentData = JSON.parse(localStorage.getItem('students')) || {};
    const studentList = Object.keys(studentData).map(email => ({
      email: email,
      ...studentData[email]
    }));
    setStudents(studentList);

    // Load results
    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const resultList = Object.keys(examResults).map(email => examResults[email]);
    setResults(resultList);

    // Load projects
    const projectData = JSON.parse(localStorage.getItem('studentProjects')) || [];
    setProjects(projectData);

    // Load schedule
    const loadInitialSchedule = async () => {
      const savedSchedule = JSON.parse(localStorage.getItem('examSchedule'));
      if (savedSchedule) {
        setExamSchedule(savedSchedule);
      } else {
        // Default to current time for start, and +1 hour for end, with a default slot
        const now = await getCurrentPKTTime();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        setExamSchedule({
          duration: 60,
          slots: [{
            start: formatForDateTimeInput(now),
            end: formatForDateTimeInput(oneHourLater),
            course: 'web'
          }]
        });
      }
    };

    loadInitialSchedule();
  }, []);

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...examSchedule.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setExamSchedule(prev => ({ ...prev, slots: newSlots }));
  };

  const addSlot = async () => {
    const now = await getCurrentPKTTime();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    setExamSchedule(prev => ({
      ...prev,
      slots: [...prev.slots, {
        start: formatForDateTimeInput(now),
        end: formatForDateTimeInput(oneHourLater),
        course: 'web'
      }]
    }));
  };

  const removeSlot = (index) => {
    const newSlots = examSchedule.slots.filter((_, i) => i !== index);
    setExamSchedule(prev => ({ ...prev, slots: newSlots }));
  };

  const handleSaveSchedule = () => {
    localStorage.setItem('examSchedule', JSON.stringify(examSchedule));
    alert('Exam settings saved successfully! These settings will override the file defaults for students.');
  };

  const handleExportResults = () => {
    exportResultsToExcel(results);
  };

  const handleExportProjects = () => {
    exportProjectsToExcel(projects);
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          className={`btn ${activeTab === 'students' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('students')}
          style={{ marginRight: '10px' }}
        >
          Students
        </button>
        <button
          className={`btn ${activeTab === 'results' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('results')}
          style={{ marginRight: '10px' }}
        >
          Exam Results
        </button>
        <button
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('projects')}
          style={{ marginRight: '10px' }}
        >
          Projects
        </button>
        <button
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="card">
          <h2>Student Management</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
            <div className="dashboard-card">
              <h3>{students.filter(s => s.averageScore > 0).length}</h3>
              <p>Active Students</p>
            </div>
            <div className="dashboard-card">
              <h3>
                {students.length > 0
                  ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
                  : 0}%
              </h3>
              <p>Average Score</p>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Progress</th>
                <th>Avg Score</th>
                <th>Assignments</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.progress}%</td>
                  <td>{student.averageScore}%</td>
                  <td>{student.assignments.submitted}/{student.assignments.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Exam Results</h2>
            <button className="btn btn-success" onClick={handleExportResults}>
              Export to Excel
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Score</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Date</th>
                <th>Start (PKT)</th>
                <th>End (PKT)</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.studentName}</td>
                  <td>{result.email}</td>
                  <td>{result.score}</td>
                  <td>{result.totalQuestions}</td>
                  <td>{result.percentage}%</td>
                  <td>{result.date}</td>
                  <td>{result.startTime || 'N/A'}</td>
                  <td>{result.endTime || 'N/A'}</td>
                  <td>{result.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Student Projects</h2>
            <button className="btn btn-success" onClick={handleExportProjects}>
              Export to Excel
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Project Title</th>
                <th>Description</th>
                <th>File Name</th>
                <th>Submission Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index}>
                  <td>{project.studentName}</td>
                  <td>{project.email}</td>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>{project.fileName}</td>
                  <td>{project.submissionDate}</td>
                  <td>{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <h2>Exam Schedule Settings</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <div className="alert alert-info" style={{ backgroundColor: '#e7f3fe', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <strong>Note:</strong> You can now assign different courses to different time slots. Settings saved here override <code>examSchedule.js</code>.
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Default Exam Duration (Minutes)</label>
              <input
                type="number"
                value={examSchedule.duration}
                onChange={(e) => setExamSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Scheduled Slots & Courses</label>
                <button className="btn btn-small btn-success" onClick={addSlot}>+ Add New Slot</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {examSchedule.slots.map((slot, index) => (
                  <div key={index} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd', position: 'relative', borderLeft: '6px solid #4CAF50' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Time</label>
                        <input
                          type="datetime-local"
                          value={slot.start}
                          onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Time</label>
                        <input
                          type="datetime-local"
                          value={slot.end}
                          onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                      <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assigned Course</label>
                      <select
                        value={slot.course || 'web'}
                        onChange={(e) => handleSlotChange(index, 'course', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                      >
                        <option value="web">Web Development (HTML/CSS)</option>
                        <option value="new_ai">New AI (Python DSA)</option>
                        <option value="old_ai">Old AI (Python Basics)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => removeSlot(index)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      title="Remove Slot"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSaveSchedule}
              style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}
            >
              Save All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
