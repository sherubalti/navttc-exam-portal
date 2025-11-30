// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import mcqsData from '../data/mcqs.json';

// const Exam = ({ user }) => {
//   const navigate = useNavigate();
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
//   const [examStarted, setExamStarted] = useState(false);

//   useEffect(() => {
//     // Check if user has already attempted
//     const results = JSON.parse(localStorage.getItem('examResults')) || {};
//     if (results[user.email]) {
//       alert('You have already attempted the exam.');
//       navigate('/result');
//       return;
//     }

//     // Shuffle questions for each student
//     const shuffledQuestions = [...mcqsData.questions]
//       .sort(() => Math.random() - 0.5)
//       .slice(0, 10); // Take 10 random questions for demo

//     setQuestions(shuffledQuestions);
//   }, [user.email, navigate]);

//   useEffect(() => {
//     if (!examStarted) return;

//     const timer = setInterval(() => {
//       setTimeLeft(prevTime => {
//         if (prevTime <= 1) {
//           clearInterval(timer);
//           handleSubmit();
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [examStarted]);

//   const handleAnswer = (questionIndex, answer) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionIndex]: answer
//     }));
//   };

//   const handleSubmit = () => {
//     let score = 0;
//     const results = [];

//     questions.forEach((question, index) => {
//       const isCorrect = answers[index] === question.answer;
//       if (isCorrect) score++;
      
//       results.push({
//         question: question.question,
//         userAnswer: answers[index],
//         correctAnswer: question.answer,
//         isCorrect: isCorrect,
//         explanation: question.explanation
//       });
//     });

//     // Save result
//     const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
//     examResults[user.email] = {
//       studentName: user.name,
//       email: user.email,
//       score: score,
//       totalQuestions: questions.length,
//       percentage: Math.round((score / questions.length) * 100),
//       date: new Date().toLocaleDateString(),
//       timeTaken: formatTime(60 * 60 - timeLeft),
//       details: results
//     };
//     localStorage.setItem('examResults', JSON.stringify(examResults));

//     // Update user's average score
//     const users = JSON.parse(localStorage.getItem('students')) || {};
//     if (users[user.email]) {
//       users[user.email].averageScore = Math.round((score / questions.length) * 100);
//       localStorage.setItem('students', JSON.stringify(users));
//     }

//     navigate('/result');
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const startExam = () => {
//     setExamStarted(true);
//   };

//   if (questions.length === 0) {
//     return <div className="container">Loading questions...</div>;
//   }

//   if (!examStarted) {
//     return (
//       <div className="container">
//         <div className="card">
//           <h2>Exam Instructions</h2>
//           <ul style={{ textAlign: 'left', margin: '20px 0' }}>
//             <li>Total Questions: {questions.length}</li>
//             <li>Time Allowed: 60 minutes</li>
//             <li>Each question has 4 options</li>
//             <li>You cannot go back once submitted</li>
//             <li>Exam will auto-submit when time expires</li>
//           </ul>
//           <button className="btn btn-primary" onClick={startExam}>
//             Start Exam
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container">
//       <div className="card">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h2>Exam - Question {currentQuestion + 1} of {questions.length}</h2>
//           <div className="timer">Time Left: {formatTime(timeLeft)}</div>
//         </div>

//         <div className="question-card">
//           <h3>{questions[currentQuestion].question}</h3>
//           <p><strong>Category:</strong> {questions[currentQuestion].category}</p>
          
//           <div className="options">
//             {questions[currentQuestion].options.map((option, index) => {
//               const letter = String.fromCharCode(97 + index);
//               return (
//                 <label key={index}>
//                   <input
//                     type="radio"
//                     name={`question-${currentQuestion}`}
//                     value={letter}
//                     checked={answers[currentQuestion] === letter}
//                     onChange={() => handleAnswer(currentQuestion, letter)}
//                   />
//                   {letter.toUpperCase()}. {option}
//                 </label>
//               );
//             })}
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
//           <button
//             className="btn"
//             onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
//             disabled={currentQuestion === 0}
//           >
//             Previous
//           </button>
          
//           {currentQuestion === questions.length - 1 ? (
//             <button className="btn btn-success" onClick={handleSubmit}>
//               Submit Exam
//             </button>
//           ) : (
//             <button
//               className="btn btn-primary"
//               onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
//             >
//               Next
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Exam;


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import mcqsData from '../data/mcqs.json';

const Exam = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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
    // Check if user has already attempted
    const results = JSON.parse(localStorage.getItem('examResults')) || {};
    if (results[user.email]) {
      alert('You have already attempted the exam.');
      navigate('/result');
      return;
    }

    // Use all questions and shuffle them
    const shuffledQuestions = shuffleArray(mcqsData.questions);
    setQuestions(shuffledQuestions);
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

  const startExam = () => {
    setExamStarted(true);
  };

  if (questions.length === 0) {
    return <div className="container">Loading questions...</div>;
  }

  if (!examStarted) {
    return (
      <div className="container">
        <div className="card">
          <h2>Exam Instructions</h2>
          <ul style={{ textAlign: 'left', margin: '20px 0' }}>
            <li>Total Questions: {questions.length}</li>
            <li>Time Allowed: 60 minutes</li>
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