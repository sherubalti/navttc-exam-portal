import React, { useState } from 'react';
import { getCurrentPKTTime } from '../utils/timeUtility';

const ProjectUpload = ({ user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    const projects = JSON.parse(localStorage.getItem('studentProjects')) || [];
    const nowPKT = await getCurrentPKTTime();

    const newProject = {
      studentName: user.name,
      email: user.email,
      title: title,
      description: description,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      submissionDate: nowPKT.toLocaleString('en-PK', { dateStyle: 'medium' }),
      status: 'Submitted'
    };

    projects.push(newProject);
    localStorage.setItem('studentProjects', JSON.stringify(projects));

    setSuccess('Project submitted successfully!');

    // Reset form
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Upload Final Project</h2>

        {success && (
          <div style={{ color: 'green', marginBottom: '20px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Title:</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Project Description:</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Project File (PDF/DOC/PPT):</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              required
            />
            {file && (
              <p style={{ marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                Selected file: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-success">
            Submit Project
          </button>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
          <h4>Submission Guidelines:</h4>
          <ul style={{ textAlign: 'left' }}>
            <li>File size should not exceed 10MB</li>
            <li>Accepted formats: PDF, DOC, DOCX, PPT, PPTX</li>
            <li>Include proper documentation</li>
            <li>Ensure all team members are credited</li>
            <li>Submit before the deadline: December 15, 2023</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectUpload;
