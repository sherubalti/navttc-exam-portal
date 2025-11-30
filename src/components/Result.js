import React, { useState, useEffect } from 'react';

const Result = ({ user }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    setResult(examResults[user.email]);
  }, [user.email]);

  if (!result) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Exam Results Found</h2>
          <p>You haven't attempted any exam yet.</p>
          <a href="/exam" className="btn btn-primary">Take Exam</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Exam Results</h2>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>{result.score}/{result.totalQuestions}</h3>
            <p>Score</p>
          </div>
          
          <div className="dashboard-card">
            <h3>{result.percentage}%</h3>
            <p>Percentage</p>
          </div>
          
          <div className="dashboard-card">
            <h3>{result.timeTaken}</h3>
            <p>Time Taken</p>
          </div>
          
          <div className="dashboard-card">
            <h3>{result.date}</h3>
            <p>Date</p>
          </div>
        </div>

        <h3 style={{ marginTop: '30px' }}>Detailed Results</h3>
        
        {result.details.map((detail, index) => (
          <div key={index} className="question-card">
            <h4>Question {index + 1}: {detail.question}</h4>
            <p>
              Your answer: <span className={detail.isCorrect ? 'correct' : 'wrong'}>
                {detail.userAnswer ? detail.userAnswer.toUpperCase() : 'Not answered'}
              </span>
            </p>
            <p>
              Correct answer: <span className="correct">{detail.correctAnswer.toUpperCase()}</span>
            </p>
            {!detail.isCorrect && (
              <p><strong>Explanation:</strong> {detail.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;