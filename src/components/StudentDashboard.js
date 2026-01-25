import React, { useState, useEffect } from 'react';

const StudentDashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('students')) || {};
    setUserData(users[user.email]);
  }, [user.email]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const totalClasses = userData.attendance.present + userData.attendance.absent + userData.attendance.leave;
  const attendanceRate = totalClasses > 0 ? Math.round((userData.attendance.present / totalClasses) * 100) : 0;

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      <p>Welcome back, {user.name}!</p>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{userData.progress}%</h3>
          <p>Overall Progress</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{userData.attendance.present}/30</h3>
          <p>Classes Attended</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{userData.assignments.submitted}/{userData.assignments.total}</h3>
          <p>Assignments Submitted</p>
        </div>
        
        <div className="dashboard-card">
          <h3>{userData.averageScore}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      <div className="card">
        <h3>Attendance Summary</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>{userData.attendance.present}</h3>
            <p>Present</p>
          </div>
          <div className="dashboard-card">
            <h3>{userData.attendance.absent}</h3>
            <p>Absent</p>
          </div>
          <div className="dashboard-card">
            <h3>{userData.attendance.leave}</h3>
            <p>Leave</p>
          </div>
          <div className="dashboard-card">
            <h3>{attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/exam" className="btn btn-primary">Take Exam</a>
          <a href="/result" className="btn btn-success">View Results</a>
          <a href="/project-upload" className="btn">Upload Project</a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
