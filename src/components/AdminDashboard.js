import React, { useState, useEffect } from 'react';
import { exportResultsToExcel, exportProjectsToExcel } from '../utils/exportToExcel';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('students');

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
  }, []);

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
        >
          Projects
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
    </div>
  );
};

export default AdminDashboard;