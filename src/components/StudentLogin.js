import React, { useState } from 'react';

const StudentLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('students')) || {};
    
    if (users[email] && users[email].password === password) {
      onLogin({
        email: email,
        name: users[email].name
      }, false);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <h2>Student Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
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
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Login
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <a href="/student-register">Register here</a>
      </p>
    </div>
  );
};

export default StudentLogin;
