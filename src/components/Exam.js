


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import webMcqs from '../data/web_mcqs.json';
import oldMcqs from '../data/old_mcqs.json';
import pythonDsaMcqs from '../data/mcqs_python_dsa.json';
import examSchedule from '../data/examSchedule';
import { getCurrentPKTTime } from '../utils/timeUtility';

const Exam = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // Default 60 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState('active'); // 'active', 'upcoming', 'ended'
  const [activeSlot, setActiveSlot] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState(examSchedule);
  const [loadingTime, setLoadingTime] = useState(true);
  const [startTimePKT, setStartTimePKT] = useState(null);

  // Map exam type to data
  const mcqModules = {
    web: webMcqs,
    new_ai: pythonDsaMcqs,
    old_ai: oldMcqs
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

  useEffect(() => {
    const checkSchedule = async () => {
      // Check if user has already attempted
      const results = JSON.parse(localStorage.getItem('examResults')) || {};
      if (results[user.email]) {
        alert('You have already attempted the exam.');
        navigate('/result');
        return;
      }

      // Check exam schedule from static config or localStorage
      let schedule = examSchedule;
      const savedSchedule = JSON.parse(localStorage.getItem('examSchedule'));
      if (savedSchedule) {
        schedule = savedSchedule;
      }
      setCurrentSchedule(schedule);

      if (schedule && schedule.slots) {
        setLoadingTime(true);
        const now = await getCurrentPKTTime();
        setLoadingTime(false);

        let currentStatus = 'upcoming';
        let foundSlot = null;

        // Check all slots
        const allStarts = schedule.slots.map(s => new Date(s.start));
        const allEnds = schedule.slots.map(s => new Date(s.end));

        const earliestStart = new Date(Math.min(...allStarts));
        const latestEnd = new Date(Math.max(...allEnds));

        if (now < earliestStart) {
          currentStatus = 'upcoming';
        } else if (now > latestEnd) {
          currentStatus = 'ended';
        } else {
          // We are within the overall timeframe, check for an active slot
          foundSlot = schedule.slots.find(slot => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            return now >= start && now <= end;
          });

          if (foundSlot) {
            currentStatus = 'active';
          } else {
            // Between slots
            currentStatus = 'upcoming';
          }
        }

        setScheduleStatus(currentStatus);
        setActiveSlot(foundSlot);

        if (currentStatus === 'active') {
          const duration = schedule.duration || 60;
          setTimeLeft(duration * 60);

          // Load dynamic MCQs based on selection IN THE SLOT
          const course = foundSlot.course || 'web';
          const selectedMcqData = mcqModules[course] || mcqModules.web;
          const shuffledQuestions = shuffleArray(selectedMcqData.questions);
          setQuestions(shuffledQuestions);
        }
      }
    };

    checkSchedule();
  }, [user.email, navigate]);

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

  // Timer effect
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

  const handleSubmit = useCallback(async () => {
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

    const nowPKT = await getCurrentPKTTime();

    // Save result
    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    examResults[user.email] = {
      studentName: user.name,
      email: user.email,
      score: score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      date: nowPKT.toLocaleString('en-PK', { dateStyle: 'medium' }),
      startTime: activeSlot ? new Date(activeSlot.start).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
      endTime: activeSlot ? new Date(activeSlot.end).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
      timeTaken: formatTime(60 * 60 - timeLeft),
      details: results,
      violationCount: violationCount
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

  const startExam = async () => {
    setLoadingTime(true);
    const now = await getCurrentPKTTime();
    setLoadingTime(false);

    // One last check to ensure the slot is still active
    const isStillActive = currentSchedule.slots.some(slot => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return now >= start && now <= end;
    });

    if (!isStillActive) {
      alert('This exam slot has ended or is not yet active.');
      window.location.reload();
      return;
    }

    setStartTimePKT(now);
    setExamStarted(true);
  };

  // Schedule Checks
  if (loadingTime) {
    return <div className="container">Synchronizing Pakistan Time...</div>;
  }

  if (scheduleStatus === 'upcoming') {
    return (
      <div className="container">
        <div className="card">
          <h2>No Active Exam Slot</h2>
          <p>There is no exam scheduled for the current time.</p>
          <div style={{ margin: '20px 0', textAlign: 'left' }}>
            <h4>Available Time Slots:</h4>
            {currentSchedule.slots.map((slot, index) => (
              <div key={index} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{new Date(slot.start).toLocaleString()}</strong><br />
                  <small>to {new Date(slot.end).toLocaleString()}</small>
                </div>
                <div style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#1976d2' }}>
                  {(slot.course || 'web').replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
          <p>Please come back during one of the scheduled times.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (scheduleStatus === 'ended') {
    return (
      <div className="container">
        <div className="card">
          <h2>Exam Schedule Has Ended</h2>
          <p>All scheduled time slots for this exam have passed.</p>
          <div style={{ margin: '20px 0', opacity: 0.7 }}>
            <h4>Past Slots:</h4>
            {currentSchedule.slots.map((slot, index) => (
              <div key={index} style={{ textDecoration: 'line-through' }}>
                {new Date(slot.start).toLocaleString()}
              </div>
            ))}
          </div>
          <p>You can no longer attempt this exam.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="container">Loading questions...</div>;
  }

  if (!examStarted) {
    const welcomeMessages = {
      new_ai: "Welcome to BSL New AI Bench",
      web: "Welcome to BSL Web Class",
      old_ai: "Welcome to BSL Old AI Bench"
    };
    const course = activeSlot?.course || 'web';
    const welcomeText = welcomeMessages[course] || "Welcome to BSL Exam Portal";

    return (
      <div className="container">
        <div className="card">
          <h2 style={{ color: '#1976d2' }}>{welcomeText}</h2>
          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
          <h2>Exam Instructions</h2>
          <ul style={{ textAlign: 'left', margin: '20px 0' }}>
            <li>Total Questions: {questions.length}</li>
            <li>Time Allowed: {Math.floor(timeLeft / 60)} minutes</li>
            <li>Each question has 4 options</li>
            <li>You cannot go back once submitted</li>
            <li>Exam will auto-submit when time expires</li>
            <li><strong>Warning:</strong> Switching tabs/windows will result in automatic submission after 3 violations</li>
            <li>Right-click and developer tools are disabled during exam</li>
          </ul>
          <button className="btn btn-primary" onClick={startExam}>
            Start Exam
          </button>
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
          <h2>Exam - Question {currentQuestion + 1} of {questions.length}</h2>
          <div className="timer">
            Time Left: {formatTime(timeLeft)}
            {violationCount > 0 && (
              <div style={{ fontSize: '12px', color: 'red' }}>
                Violations: {violationCount}/3
              </div>
            )}
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
                className={`btn-small ${currentQuestion === index ? 'btn-primary' :
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
