


import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';

const Result = ({ user }) => {
  const [result, setResult] = useState(null);
  const hasSentRef = useRef(false);

  // -----------------------------
  //  SEND EMAIL FUNCTION
  // -----------------------------
  const sendEmail = (examResult) => {
    if (!examResult) return;

    const SERVICE_ID = "service_5tzm50o";
    const TEMPLATE_ID = "template_32uhumh";
    const PUBLIC_KEY = "rdrLtx3ektaxB41qt";
    const ADMIN_EMAIL = "sheralishahid1010@gmail.com";

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn("EmailJS missing config!");
      return;
    }

    // Unique ID for preventing duplicate emails
    const resultId =
      examResult.date ||
      `${examResult.score}-${examResult.totalQuestions}-${examResult.timeTaken}`;

    try {
      const sentMap =
        JSON.parse(localStorage.getItem("sentExamEmails") || "{}") || {};
      const userSent = sentMap[user?.email] || [];

      if (userSent.includes(resultId)) {
        console.log("Email already sent for this result.");
        return;
      }

      userSent.push(resultId);
      sentMap[user?.email] = userSent;
      localStorage.setItem("sentExamEmails", JSON.stringify(sentMap));
    } catch (err) {
      console.error("Error reading email sent map", err);
    }

    // Create safe readable details list
    const detailsString =
      examResult.details
        ?.map(
          (d, i) =>
            `Q${i + 1}: ${d?.isCorrect ? "Correct" : "Incorrect"}`
        )
        .join("\n") || "No details";

    // Email values
    const templateParams = {
      user_name: user?.name || "Student",
      user_email: user?.email || "",
      score: examResult.score || 0,
      totalQuestions: examResult.totalQuestions || 0,
      percentage: examResult.percentage || 0,
      timeTaken: examResult.timeTaken || "N/A",
      date: examResult.date || "N/A",
      details: detailsString,
    };

    console.log("Sending EmailJS params:", templateParams);

    // Send to student
    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        console.log("Email sent to student!");

        // Send copy to admin
        if (ADMIN_EMAIL !== user?.email) {
          const adminParams = {
            ...templateParams,
            user_email: ADMIN_EMAIL,
          };

          emailjs
            .send(SERVICE_ID, TEMPLATE_ID, adminParams, PUBLIC_KEY)
            .then(() => console.log("Admin email sent"))
            .catch((err) => console.error("Admin email failed", err));
        }
      })
      .catch((err) => console.error("EmailJS send error", err));
  };

  // -----------------------------
  // LOAD RESULT + AUTO SEND EMAIL
  // -----------------------------
  useEffect(() => {
    try {
      emailjs.init("rdrLtx3ektaxB41qt");
    } catch {}

    const allResults =
      JSON.parse(localStorage.getItem("examResults")) || {};

    const userResult = allResults[user.email];
    setResult(userResult);

    console.log("Loaded user:", user);
    console.log("Loaded result:", userResult);

    if (!userResult) return;

    // Prevent double send
    const resultId =
      userResult.date ||
      `${userResult.score}-${userResult.totalQuestions}-${userResult.timeTaken}`;

    try {
      const sentMap =
        JSON.parse(localStorage.getItem("sentExamEmails") || "{}") || {};
      const userSent = sentMap[user.email] || [];

      if (userSent.includes(resultId)) {
        console.log("Already sent earlier.");
        hasSentRef.current = true;
        return;
      }
    } catch {}

    // Send email one time only
    if (!hasSentRef.current && userResult) {
      sendEmail(userResult);
      hasSentRef.current = true;
    }
  }, [user.email]);

  // -----------------------------
  // NO RESULT
  // -----------------------------
  if (!result) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Exam Results Found</h2>
          <p>You haven't attempted any exam yet.</p>
          <a href="/exam" className="btn btn-primary">
            Take Exam
          </a>
        </div>
      </div>
    );
  }

  // -----------------------------
  // RESULT DISPLAY
  // -----------------------------
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

        <h3 style={{ marginTop: "30px" }}>Detailed Results</h3>

        {result.details?.map((detail, index) => (
          <div key={index} className="question-card">
            <h4>Question {index + 1}: {detail?.question || "No question text"}</h4>

            <p>
              Your answer:{" "}
              <span className={detail?.isCorrect ? "correct" : "wrong"}>
                {detail?.userAnswer
                  ? detail.userAnswer.toUpperCase()
                  : "Not answered"}
              </span>
            </p>

            <p>
              Correct answer:{" "}
              <span className="correct">
                {detail?.correctAnswer
                  ? detail.correctAnswer.toUpperCase()
                  : "N/A"}
              </span>
            </p>

            {!detail?.isCorrect && detail?.explanation && (
              <p>
                <strong>Explanation:</strong> {detail.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Result;
