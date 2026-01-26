import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentPKTTime } from '../utils/timeUtility';

const Login = ({ onLogin, userType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isRegister = userType === 'register';
  const isAdmin = userType === 'admin';

  const validateForm = () => {
    const newErrors = {};

    if (isRegister && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isRegister) {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const nowPKT = await getCurrentPKTTime();

      const userData = {
        name: formData.name || 'Student User',
        email: formData.email,
        studentId: formData.studentId || `STU${Math.random().toString(36).substr(2, 9)}`,
        loginTime: nowPKT.toLocaleString('en-PK')
      };

      // Save to localStorage
      if (isRegister) {
        const users = JSON.parse(localStorage.getItem('students')) || {};
        users[formData.email] = {
          ...userData,
          averageScore: 0,
          attempts: 0,
          joinDate: nowPKT.toISOString()
        };
        localStorage.setItem('students', JSON.stringify(users));
      }

      onLogin(userData, isAdmin);

    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <div className="text-center mb-3">
          <h2>
            {isRegister ? 'Student Registration' :
              isAdmin ? 'Admin Login' : 'Student Login'}
          </h2>
          <p className="text-muted">
            {isRegister ? 'Create your account' :
              isAdmin ? 'Access admin dashboard' : 'Sign in to your account'}
          </p>
        </div>

        {errors.submit && (
          <div className="alert alert-error">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="studentId"
                className={`form-control ${errors.studentId ? 'error' : ''}`}
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter your student ID"
              />
              {errors.studentId && <div className="error-message">{errors.studentId}</div>}
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></div>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          {isRegister ? (
            <p>
              Already have an account? <Link to="/student-login">Sign In</Link>
            </p>
          ) : isAdmin ? (
            <p>
              Student? <Link to="/student-login">Student Login</Link>
            </p>
          ) : (
            <>
              <p>
                Don't have an account? <Link to="/student-register">Register Here</Link>
              </p>
              <p>
                Admin? <Link to="/admin-login">Admin Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
