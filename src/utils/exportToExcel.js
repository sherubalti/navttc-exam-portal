import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportResultsToExcel = (results) => {
  const exportData = results.map(result => ({
    'Student Name': result.studentName,
    'Email': result.email,
    'Score': result.score,
    'Total Questions': result.totalQuestions,
    'Percentage': `${result.percentage}%`,
    'Date': result.date,
    'Time Taken': result.timeTaken
  }));
  exportToExcel(exportData, 'student_results');
};

export const exportProjectsToExcel = (projects) => {
  const exportData = projects.map(project => ({
    'Student Name': project.studentName,
    'Email': project.email,
    'Project Title': project.title,
    'Description': project.description,
    'File Name': project.fileName,
    'Submission Date': project.submissionDate,
    'Status': project.status
  }));
  exportToExcel(exportData, 'student_projects');
};