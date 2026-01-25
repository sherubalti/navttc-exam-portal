// import React, { useState, useEffect } from 'react';

// const Result = ({ user }) => {
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
//     setResult(examResults[user.email]);
//   }, [user.email]);

//   if (!result) {
//     return (
//       <div className="container">
//         <div className="card">
//           <h2>No Exam Results Found</h2>
//           <p>You haven't attempted any exam yet.</p>
//           <a href="/exam" className="btn btn-primary">Take Exam</a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container">
//       <div className="card">
//         <h2>Exam Results</h2>
        
//         <div className="dashboard-grid">
//           <div className="dashboard-card">
//             <h3>{result.score}/{result.totalQuestions}</h3>
//             <p>Score</p>
//           </div>
          
//           <div className="dashboard-card">
//             <h3>{result.percentage}%</h3>
//             <p>Percentage</p>
//           </div>
          
//           <div className="dashboard-card">
//             <h3>{result.timeTaken}</h3>
//             <p>Time Taken</p>
//           </div>
          
//           <div className="dashboard-card">
//             <h3>{result.date}</h3>
//             <p>Date</p>
//           </div>
//         </div>

//         <h3 style={{ marginTop: '30px' }}>Detailed Results</h3>
        
//         {result.details.map((detail, index) => (
//           <div key={index} className="question-card">
//             <h4>Question {index + 1}: {detail.question}</h4>
//             <p>
//               Your answer: <span className={detail.isCorrect ? 'correct' : 'wrong'}>
//                 {detail.userAnswer ? detail.userAnswer.toUpperCase() : 'Not answered'}
//               </span>
//             </p>
//             <p>
//               Correct answer: <span className="correct">{detail.correctAnswer.toUpperCase()}</span>
//             </p>
//             {!detail.isCorrect && (
//               <p><strong>Explanation:</strong> {detail.explanation}</p>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Result;


import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';

const Result = ({ user }) => {
  const [result, setResult] = useState(null);
  const hasSentRef = useRef(false);

  // Function to send email via EmailJS
  const sendEmail = (examResult) => {
    if (!examResult) return;

    // Read EmailJS config from env with fallbacks to existing values
    const SERVICE_ID = "service_5tzm50o";
    const TEMPLATE_ID = "template_wznd4o3";
    const PUBLIC_KEY ="rdrLtx3ektaxB41qt";
    const ADMIN_EMAIL = 'sheralishahid1010@gmail.com';

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn('EmailJS not configured (SERVICE/TEMPLATE/PUBLIC missing). Skipping email send.');
      return;
    }

    // Prevent duplicate sends: check localStorage flag per user+result
    const resultId = examResult.date || `${examResult.score}-${examResult.totalQuestions}-${examResult.timeTaken}`;
    try {
      const sentMap = JSON.parse(localStorage.getItem('sentExamEmails') || '{}');
      const userSent = sentMap[user?.email] || [];
      if (userSent.includes(resultId)) {
        console.log('Result email already sent for', user?.email, resultId);
        return;
      }
      // Mark as sent before sending to prevent duplicates
      userSent.push(resultId);
      sentMap[user?.email] = userSent;
      localStorage.setItem('sentExamEmails', JSON.stringify(sentMap));
    } catch (e) {
      // ignore parse errors and continue
    }

    // Convert detailed results into a readable string (shortened to avoid EmailJS 50kb limit)
    const detailsString = examResult.details?.map((d, i) => 
      `Q${i + 1}: ${d.isCorrect ? 'Correct' : 'Incorrect'}`
    ).join('\n') || 'No details';

    const templateParams = {
      user_name: user?.name || user?.email || 'Student',
      user_email: user?.email || '',
      score: examResult.score || 0,
      totalQuestions: examResult.totalQuestions || 0,
      percentage: examResult.percentage || 0,
      timeTaken: examResult.timeTaken || 'N/A',
      date: examResult.date || 'N/A',
      details: detailsString,
    };

    // Send to user (template must allow dynamic recipient via {user_email})
    console.log('EmailJS templateParams:', templateParams);
    emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    )
    .then(() => {
      console.log('Email sent successfully to user');

      // Optionally send a copy to admin if configured and different from the user
      if (ADMIN_EMAIL && ADMIN_EMAIL !== (user?.email || '')) {
        const adminParams = { ...templateParams, user_email: ADMIN_EMAIL };
        emailjs.send(SERVICE_ID, TEMPLATE_ID, adminParams, PUBLIC_KEY)
          .then(() => console.log('Admin copy sent successfully'))
          .catch(err => console.error('Failed to send admin copy:', err));
      }
    })
    .catch(err => {
      console.error('Failed to send email to user:', err);
    });
  };

  // Load result from localStorage
  useEffect(() => {
    // Initialize EmailJS with public key (safe to call on client)
    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (PUBLIC_KEY) {
      try {
        emailjs.init(PUBLIC_KEY);
      } catch (e) {
        // init may be a no-op if already initialized
      }
    }

    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const userResult = examResults[user.email];
    setResult(userResult);

    console.log('User object:', user);
    console.log('User result:', userResult);

    // Check if already sent via localStorage
    const resultId = userResult?.date || `${userResult?.score}-${userResult?.totalQuestions}-${userResult?.timeTaken}`;
    if (resultId) {
      try {
        const sentMap = JSON.parse(localStorage.getItem('sentExamEmails') || '{}');
        const userSent = sentMap[user?.email] || [];
        if (userSent.includes(resultId)) {
          console.log('Result email already sent for', user?.email, resultId);
          hasSentRef.current = true;
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    // Automatically send email when result exists and not already sent
    if (userResult && !hasSentRef.current) {
      sendEmail(userResult);
      hasSentRef.current = true;
    }
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
        {result.details?.map((detail, index) => (
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
