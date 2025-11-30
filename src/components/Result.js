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


import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const Result = ({ user }) => {
  const [result, setResult] = useState(null);

  // Function to send email via EmailJS
  const sendEmail = (examResult) => {
    if (!examResult) return;

    // Convert detailed results into a readable string
    const detailsString = examResult.details?.map((d, i) => 
      `Q${i + 1}: ${d.question}\nYour answer: ${d.userAnswer || 'Not answered'}\nCorrect answer: ${d.correctAnswer}\n${d.isCorrect ? 'Correct' : 'Wrong'}\nExplanation: ${d.explanation || 'N/A'}`
    ).join('\n\n') || 'No details';

    const templateParams = {
      user_name: user.name || user.email,       // Must match {user_name} in template
      user_email: 'sheralishahid1010@gmail.com', // Optional if you want to show recipient
      score: examResult.score || 0,            // Must match {score}
      totalQuestions: examResult.totalQuestions || 0, // Must match {totalQuestions}
      percentage: examResult.percentage || 0,  // Must match {percentage}
      timeTaken: examResult.timeTaken || 'N/A', // Must match {timeTaken}
      date: examResult.date || 'N/A',          // Must match {date}
      details: detailsString,                  // Must match {details}
    };

    emailjs.send(
      'service_5tzm50o',       // Your Service ID
      'template_wznd4o3',      // Your Template ID
      templateParams,
      'rdrLtx3ektaxB41qt'      // Your Public Key
    )
    .then(() => {
      console.log('Email sent successfully');
    })
    .catch(err => {
      console.error('Failed to send email:', err);
    });
  };

  // Load result from localStorage
  useEffect(() => {
    const examResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const userResult = examResults[user.email];
    setResult(userResult);

    // Automatically send email when result exists
    if (userResult) {
      sendEmail(userResult);
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
