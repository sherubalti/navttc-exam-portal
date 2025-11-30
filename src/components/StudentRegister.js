import React, { useState } from 'react';

const StudentRegister = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const users = JSON.parse(localStorage.getItem('students')) || {};

    if (users[email]) {
      setError('User with this email already exists');
      return;
    }

    // Register new user
    users[email] = {
      name: name,
      password: password,
      progress: 0,
      attendance: { present: 0, absent: 0, leave: 0 },
      assignments: { submitted: 0, total: 3 },
      averageScore: 0
    };

    localStorage.setItem('students', JSON.stringify(users));
    setSuccess('Registration successful! You can now login.');

    // Auto-login after registration
    setTimeout(() => {
      onLogin({
        email: email,
        name: name
      }, false);
    }, 2000);
  };

  return (
    <div className="auth-container">
      <h2>Student Registration</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
          Register
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <a href="/student-login">Login here</a>
      </p>
    </div>
  );
};

export default StudentRegister;