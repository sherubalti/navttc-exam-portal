import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize localStorage data if not exists
if (!localStorage.getItem('students')) {
  localStorage.setItem('students', JSON.stringify({}));
}

if (!localStorage.getItem('examResults')) {
  localStorage.setItem('examResults', JSON.stringify({}));
}

if (!localStorage.getItem('studentProjects')) {
  localStorage.setItem('studentProjects', JSON.stringify([]));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);