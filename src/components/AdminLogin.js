import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Fixed admin credentials
    if (username === 'admin' && password === 'admin123') {
      onLogin({
        name: 'Administrator'
      }, true);
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          Login as Admin
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;