import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import mcqsData from '../data/mcqs.json';

const Exam = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [examStatus, setExamStatus] = useState('checking'); // 'checking', 'not-available', 'available', 'ended'
  const [examTimeInfo, setExamTimeInfo] = useState(null);

  // Fixed exam schedule - TESTING TIMES
  const EXAM_SCHEDULE = {
    startDate: new Date('2025-12-28T12:30:00'), // Today, 8:26 PM (for testing)
    endDate: new Date('2025-12-28T13:30:00'),   // Today, 9:30 PM (for testing)
    duration: 30 * 60 // 30 minutes in seconds
  };

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check exam availability
  const checkExamAvailability = useCallback(() => {
    const now = new Date();
    const examStartTime = EXAM_SCHEDULE.startDate;
    const examEndTime = EXAM_SCHEDULE.endDate;
    
    console.log("Current time:", now.toLocaleString());
    console.log("Exam start:", examStartTime.toLocaleString());
    console.log("Exam end:", examEndTime.toLocaleString());
    console.log("Now < start?", now < examStartTime);
    console.log("Now > end?", now > examEndTime);
    
    // If exam hasn't started yet
    if (now < examStartTime) {
      const timeUntilStart = Math.floor((examStartTime - now) / 1000);
      setExamStatus('not-available');
      setExamTimeInfo({
        message: 'Exam will start soon',
        timeLeft: timeUntilStart,
        type: 'waiting'
      });
      return false;
    }
    
    // If exam has ended
    if (now > examEndTime) {
      setExamStatus('ended');
      setExamTimeInfo({
        message: 'Exam has ended',
        type: 'ended'
      });
      return false;
    }
    
    // If exam is currently running
    if (now >= examStartTime && now <= examEndTime) {
      setExamStatus('available');
      
      // Calculate how much time user has left (considering they might start late)
      const userAvailableTime = Math.floor((examEndTime - now) / 1000);
      const examDuration = EXAM_SCHEDULE.duration;
      
      // User gets the shorter of: remaining exam window or full duration
      const actualTimeLeft = Math.min(userAvailableTime, examDuration);
      
      console.log("User available time:", userAvailableTime, "seconds");
      console.log("Exam duration:", examDuration, "seconds");
      console.log("Actual time left:", actualTimeLeft, "seconds");
      
      setTimeLeft(actualTimeLeft);
      return true;
    }
    
    return false;
  }, []);

  useEffect(() => {
    // Check if user has already attempted
    const results = JSON.parse(localStorage.getItem('examResults')) || {};
    if (results[user.email]) {
      alert('You have already attempted the exam.');
      navigate('/result');
      return;
    }

    // Check exam availability
    const isAvailable = checkExamAvailability();
    
    if (isAvailable) {
      // Use all questions and shuffle them
      const shuffledQuestions = shuffleArray(mcqsData.questions);
      setQuestions(shuffledQuestions);
    }
    
    // Update countdown for waiting state
    if (examStatus === 'not-available') {
      const interval = setInterval(() => {
        checkExamAvailability();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [user.email, navigate, checkExamAvailability, examStatus]);

  // Tab switching detection
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - user switched tab
        const newCount = violationCount + 1;
        setViolationCount(newCount);
        setShowWarning(true);

        if (newCount >= 3) {
          // Auto-submit on 3rd violation
          handleSubmit();
          alert('Exam terminated due to multiple tab violations.');
        } else {
          // Show warning
          setTimeout(() => setShowWarning(false), 3000);
        }
      }
    };

    const handleBlur = () => {
      // Alternative detection method
      const newCount = violationCount + 1;
      setViolationCount(newCount);
      setShowWarning(true);

      if (newCount >= 3) {
        handleSubmit();
        alert('Exam terminated due to multiple tab violations.');
      } else {
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted, violationCount]);

  // Prevent right-click, copy, paste, etc.
  useEffect(() => {
    if (!examStarted) return;

    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    const disableKeys = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, etc.
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeys);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeys);
    };
  }, [examStarted]);

  // Timer effect for exam
  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  const handleAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = useCallback(() => {
    let score = 0;
    const results = [];

    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.answer;
      if (isCorrect) score++;
      
      results.push({
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.answer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    // Save result
    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    examResults[user.email] = {
      studentName: user.name,
      email: user.email,
      score: score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      date: new Date().toLocaleDateString(),
      timeTaken: formatTime(EXAM_SCHEDULE.duration - timeLeft),
      details: results,
      violationCount: violationCount,
      examStartTime: EXAM_SCHEDULE.startDate.toLocaleString(),
      examEndTime: EXAM_SCHEDULE.endDate.toLocaleString()
    };
    localStorage.setItem('examResults', JSON.stringify(examResults));

    // Update user's average score
    const users = JSON.parse(localStorage.getItem('students')) || {};
    if (users[user.email]) {
      users[user.email].averageScore = Math.round((score / questions.length) * 100);
      localStorage.setItem('students', JSON.stringify(users));
    }

    navigate('/result');
  }, [questions, answers, user, timeLeft, violationCount, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatCountdown = (seconds) => {
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const startExam = () => {
    // Re-check availability before starting
    if (checkExamAvailability()) {
      setExamStarted(true);
    } else {
      alert('Exam is no longer available. Please refresh the page.');
    }
  };

  if (questions.length === 0 && examStatus !== 'checking') {
    return (
      <div className="container">
        <div className="card">
          {examStatus === 'not-available' && examTimeInfo && (
            <>
              <h2>⏰ Exam Not Started Yet</h2>
              <p>The exam is scheduled for:</p>
              <p><strong>{EXAM_SCHEDULE.startDate.toLocaleString()}</strong></p>
              <p>Exam Window: 12:30 PM to 13:00 PM</p>
              <p>Exam Duration: 30 minutes</p>
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h3>Time until exam starts:</h3>
                <h2 style={{ color: '#4CAF50' }}>
                  {formatCountdown(examTimeInfo.timeLeft)}
                </h2>
              </div>
              <p>Please come back at the scheduled time.</p>
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
                <p><strong>Debug Info:</strong></p>
                <p>Current Time: {new Date().toLocaleString()}</p>
                <p>Exam Start: {EXAM_SCHEDULE.startDate.toLocaleString()}</p>
                <p>Exam End: {EXAM_SCHEDULE.endDate.toLocaleString()}</p>
              </div>
            </>
          )}
          
          {examStatus === 'ended' && (
            <>
              <h2>📝 Exam Has Ended</h2>
              <p>The exam window has closed.</p>
              <p><strong>Exam Schedule:</strong></p>
              <p>Start: {EXAM_SCHEDULE.startDate.toLocaleString()}</p>
              <p>End: {EXAM_SCHEDULE.endDate.toLocaleString()}</p>
              <p>Duration: 30 minutes</p>
              <p>You can no longer attempt the exam.</p>
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
                <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
              </div>
            </>
          )}
          
          {examStatus === 'available' && (
            <div>
              <h2>Loading questions...</h2>
              <p>Exam is available. Preparing your questions...</p>
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
                <p><strong>Exam Window:</strong> 8:26 PM to 9:30 PM</p>
                <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="container">
        <div className="card">
          <h2>📋 Exam Instructions</h2>
          <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
            <h3>Exam Schedule (TEST MODE):</h3>
            <p><strong>Date:</strong> 26th December 2025</p>
            <p><strong>Time Window:</strong> 8:26 PM to 9:30 PM</p>
            <p><strong>Your Available Time:</strong> 30 minutes</p>
            <p><em>Note: You must complete the exam within 30 minutes of starting</em></p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              <strong>Current Time:</strong> {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          <ul style={{ textAlign: 'left', margin: '20px 0' }}>
            <li>Total Questions: {questions.length}</li>
            <li>Time Allowed: 30 minutes (from when you start)</li>
            <li>You must complete before 9:30 PM</li>
            <li>Each question has 4 options</li>
            <li>You cannot go back once submitted</li>
            <li>Exam will auto-submit when time expires</li>
            <li><strong>Warning:</strong> Switching tabs/windows will result in automatic submission after 3 violations</li>
            <li>Right-click and developer tools are disabled during exam</li>
          </ul>
          
          <div style={{ margin: '20px 0', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
            <p><strong>⚠️ Important:</strong> Once you start, the timer will begin counting down from 30 minutes, 
            regardless of when you start within the exam window.</p>
            <p>If you start at 9:00 PM, you'll only have 30 minutes (but must finish by 9:30 PM).</p>
          </div>
          
          <button className="btn btn-primary" onClick={startExam}>
            Start Exam Now
          </button>
          
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '14px' }}>
            <p><strong>Debug Information:</strong></p>
            <p>Exam Status: {examStatus}</p>
            <p>Questions Loaded: {questions.length}</p>
            <p>Exam Available: {checkExamAvailability() ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Warning Modal */}
      {showWarning && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>⚠️ Warning!</h3>
            <p>Switching tabs/windows is not allowed during the exam.</p>
            <p>Violation {violationCount} of 3. Exam will be submitted on next violation.</p>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Exam - Question {currentQuestion + 1} of {questions.length}</h2>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Scheduled: 26 Dec 2025, 8:26 PM - 9:30 PM (TEST MODE)
            </p>
          </div>
          <div className="timer">
            <div style={{ fontWeight: 'bold', fontSize: '24px' }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ fontSize: '12px', color: timeLeft < 300 ? 'red' : '#666' }}>
              {timeLeft < 300 ? 'Less than 5 minutes left!' : 'Time remaining'}
            </div>
            {violationCount > 0 && (
              <div style={{ fontSize: '12px', color: 'red', marginTop: '5px' }}>
                Violations: {violationCount}/3
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
              Current: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="question-card">
          <h3>{questions[currentQuestion].question}</h3>
          <p><strong>Category:</strong> {questions[currentQuestion].category}</p>
          
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => {
              const letter = String.fromCharCode(97 + index);
              return (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={letter}
                    checked={answers[currentQuestion] === letter}
                    onChange={() => handleAnswer(currentQuestion, letter)}
                  />
                  <span className="option-text">{letter.toUpperCase()}. {option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ margin: '20px 0' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${((currentQuestion + 1) / questions.length) * 100}%`, 
              height: '10px', 
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '14px',
            marginTop: '5px',
            color: '#666'
          }}>
            <span>Progress: {currentQuestion + 1}/{questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            className="btn"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          
          <div>
            {currentQuestion === questions.length - 1 ? (
              <button className="btn btn-success" onClick={handleSubmit}>
                Submit Exam
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next
              </button>
            )}
          </div>

          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to submit the exam? This action cannot be undone.')) {
                handleSubmit();
              }
            }}
          >
            Submit Now
          </button>
        </div>

        {/* Question Navigation */}
        <div style={{ marginTop: '20px' }}>
          <h4>Question Navigation</h4>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '5px',
            justifyContent: 'center'
          }}>
            {questions.map((_, index) => (
              <button
                key={index}
                className={`btn-small ${
                  currentQuestion === index ? 'btn-primary' : 
                  answers[index] ? 'btn-success' : 'btn'
                }`}
                onClick={() => setCurrentQuestion(index)}
                style={{ 
                  width: '40px', 
                  height: '40px',
                  padding: 0
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;


