

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = ({ currentUser, isAdmin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  // Close sidebar when clicking on link in mobile view
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Base styles
  const mobileMenuBtnStyle = {
    display: isMobile ? 'block' : 'none',
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1001,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  };

  const sidebarStyle = {
    width: isMobile ? '280px' : '250px',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #2563eb 100%)',
    color: 'white',
    height: isMobile ? '100vh' : '100vh',
    position: isMobile ? 'fixed' : 'fixed',
    left: isMobile ? (isOpen ? '0' : '-280px') : '0',
    top: '0',
    transition: 'left 0.3s ease-in-out',
    padding: '20px 0',
    zIndex: 1000,
    overflowY: 'auto',
    boxShadow: isMobile && isOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none'
  };

  const sidebarHeaderStyle = {
    padding: '0 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const logoStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'white'
  };

  const sidebarNavStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 15px'
  };

  const linkStyle = {
    display: 'block',
    padding: '12px 15px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: 'rgba(255,255,255,0.2)',
    borderLeft: '4px solid white'
  };

  const overlayStyle = {
    display: isMobile && isOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    backdropFilter: 'blur(2px)'
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={mobileMenuBtnStyle}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div
        style={overlayStyle}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>
          <img src={logo} alt="Baltistan Silicon Labs" style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />
          {/* Removed text logos */}
          {currentUser && (
            <p style={{
              marginTop: '10px',
              fontSize: '0.9rem',
              opacity: 0.8,
              background: 'rgba(255,255,255,0.1)',
              padding: '8px',
              borderRadius: '6px'
            }}>
              Welcome, {isAdmin ? 'Admin' : currentUser.name}
            </p>
          )}
        </div>

        <nav style={sidebarNavStyle}>
          {!currentUser ? (
            <>
              <Link
                to="/student-login"
                style={location.pathname === '/student-login' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Student Login
              </Link>
              <Link
                to="/student-register"
                style={location.pathname === '/student-register' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Student Register
              </Link>
              <Link
                to="/admin-login"
                style={location.pathname === '/admin-login' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Admin Login
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link
                to="/admin-dashboard"
                style={location.pathname === '/admin-dashboard' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={linkStyle}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/student-dashboard"
                style={location.pathname === '/student-dashboard' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <Link
                to="/exam"
                style={location.pathname === '/exam' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Take Exam
              </Link>
              <Link
                to="/result"
                style={location.pathname === '/result' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                My Results
              </Link>
              <Link
                to="/project-upload"
                style={location.pathname === '/project-upload' ? activeLinkStyle : linkStyle}
                onClick={handleLinkClick}
              >
                Upload Project
              </Link>
              <button
                onClick={handleLogout}
                style={linkStyle}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div >
    </>
  );
};



export default Sidebar;
