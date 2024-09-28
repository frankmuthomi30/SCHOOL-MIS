import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2 } from 'lucide-react';

const StudentReportCards = () => {
  const [students, setStudents] = useState({});
  const [examResults, setExamResults] = useState({});
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportCards, setReportCards] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subjects = [
    'Mathematics',
    'English',
    'Kiswahili',
    'Chemistry',
    'Physics',
    'Biology',
    'Agriculture',
    'History',
    'Geography',
    'Business',
    'Compter',
    'CRE'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsRef = ref(database, 'students');
        const examResultsRef = ref(database, 'examResults');

        const studentsSnapshot = await get(studentsRef);
        const examResultsSnapshot = await get(examResultsRef);

        if (studentsSnapshot.exists() && examResultsSnapshot.exists()) {
          setStudents(studentsSnapshot.val());
          setExamResults(examResultsSnapshot.val());
        } else {
          setError('No data available');
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = (e) => {
    setSelectedForm(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const calculateAverage = (marks) => {
    if (marks.length === 0) return "N/A";
    const sum = marks.reduce((acc, mark) => acc + mark, 0);
    const average = (sum / marks.length).toFixed(2);
    return average;
  };

  const getGrade = (average) => {
    if (average >= 80.00) return "A";
    if (average >= 75.00) return "A-";
    if (average >= 70.00) return "B+";
    if (average >= 65.00) return "B";
    if (average >= 60.00) return "B-";
    if (average >= 55.00) return "C+";
    if (average >= 50.00) return "C";
    if (average >= 45.00) return "C-";
    if (average >= 40.00) return "D+";
    if (average >= 35.00) return "D";
    if (average >= 30.00) return "D-";
    return "F";
  };

  const generateReportCards = () => {
    if (!selectedForm || !selectedClass) {
      alert('Please select both Form and Class');
      return;
    }

    const filteredStudents = Object.values(students).filter((student) => {
      return student.form === selectedForm && student.classLevel === selectedClass;
    });

    if (filteredStudents.length === 0) {
      alert('No students found for the selected Form and Class');
      return;
    }

    const generatedReportCards = filteredStudents.map((student) => {
      const reportCard = {
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        form: student.form,
        classLevel: student.classLevel,
        profilePhoto: student.photoURL,
        subjects: []
      };

      subjects.forEach((subject) => {
        const subjectKey = subject.toLowerCase();
        const subjectResults = examResults[subjectKey]?.[student.admissionNumber];
        const term3Results = subjectResults?.['term 3'] || {};
        
        const openerMarks = Object.values(term3Results).find(exam => exam.examType === 'Opener')?.marks || 'N/A';
        const midtermMarks = Object.values(term3Results).find(exam => exam.examType === 'Midterm')?.marks || 'N/A';
        const endtermMarks = Object.values(term3Results).find(exam => exam.examType === 'Endterm')?.marks || 'N/A';
        
        const exams = [openerMarks, midtermMarks, endtermMarks].filter(mark => mark !== 'N/A').map(Number);
        const averageMarks = calculateAverage(exams);
        const grade = getGrade(averageMarks);
        
        reportCard.subjects.push({
          subject,
          opener: openerMarks,
          midterm: midtermMarks,
          endterm: endtermMarks,
          averageMarks,
          grade
        });
      });

      // Calculate overall average
      const validSubjects = reportCard.subjects.filter(subject => subject.averageMarks !== 'N/A');
      const overallAverageMarks = validSubjects.reduce((acc, subject) => acc + parseFloat(subject.averageMarks), 0) / validSubjects.length;
      const overallGrade = getGrade(overallAverageMarks);
      reportCard.overallAverage = overallAverageMarks.toFixed(2);
      reportCard.overallGrade = overallGrade;

      return reportCard;
    });

    setReportCards(generatedReportCards);
    setSelectedForm('');
    setSelectedClass('');
  };

  const handlePreview = (reportCard) => {
    setSelectedStudent(reportCard);
    setIsModalOpen(true);
  };

  const getCommentBasedOnAverage = (average) => {
    if (isNaN(average)) return "Insufficient data to provide a comment.";
    if (average >= 90) return "Excellent performance! Keep up the outstanding work.";
    if (average >= 80) return "Very good performance. Continue to strive for excellence.";
    if (average >= 70) return "Good performance. There's room for improvement.";
    if (average >= 60) return "Fair performance. More effort is needed to improve.";
    if (average >= 50) return "Average performance. Significant improvement is required.";
    return "Below average performance. Urgent attention and hard work are necessary.";
  };

  const downloadPDF = () => {
    if (!selectedStudent) return;

    try {
      const doc = new jsPDF();
      const studentReportCard = selectedStudent;

      // Add a custom font (e.g., Roboto)
      doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');

      // Helper function to add centered text
      const addCenteredText = (text, y, fontSize = 12) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(text, (pageWidth - textWidth) / 2, y);
      };

      // Header
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(0, 0, 0);
      addCenteredText("EXAMPLE SCHOOL", 15, 20);
      addCenteredText("P.O. Box 123, City, Country", 22, 12);
      addCenteredText("Tel: +123 456 7890 | Email: info@exampleschool.com", 29, 10);
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 40, 210, 10, 'F');
      doc.setTextColor(0, 0, 0);
      addCenteredText("STUDENT PROGRESS REPORT", 47, 14);

      // Student Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Name: ${studentReportCard.studentName}`, 15, 65);
      doc.text(`Admission No: ${studentReportCard.admissionNumber}`, 15, 72);
      doc.text(`Form: ${studentReportCard.form}`, 15, 79);
      doc.text(`Class: ${studentReportCard.classLevel}`, 15, 86);
      doc.text(`Term: 3`, 15, 93);
      doc.text(`Academic Year: 2024`, 15, 100);

      // Add profile photo if it exists
      if (studentReportCard.profilePhoto) {
        doc.addImage(studentReportCard.profilePhoto, 'JPEG', 150, 60, 40, 40);
      }

      // Performance Table
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 110, 190, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Academic Performance", 15, 117);

      const tableData = studentReportCard.subjects.map((subject) => {
        return [subject.subject, subject.opener, subject.midterm, subject.endterm, subject.averageMarks, subject.grade];
      });

      doc.autoTable({
        head: [['Subject', 'Opener', 'Midterm', 'Endterm', 'Average Marks', 'Grade']],
        body: tableData,
        startY: 120,
        styles: { cellPadding: 2, fontSize: 10 },
        columnStyles: { 2: { cellWidth: 60 } }
      });

      // Add overall average and grade
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Overall Average: ${studentReportCard.overallAverage}`, 15, finalY);
      doc.text(`Overall Grade: ${studentReportCard.overallGrade}`, 15, finalY + 10);

      // Add comments and signatures
      const comment = getCommentBasedOnAverage(parseFloat(studentReportCard.overallAverage));
      doc.text("Class Teacher's Comments:", 15, finalY + 30);
      doc.setFontSize(10);
      doc.text(comment, 15, finalY + 37, { maxWidth: 180 });

      doc.setFontSize(12);
      doc.text("Principal's Comments:", 15, finalY + 60);
      doc.line(15, finalY + 65, 195, finalY + 65);
      doc.line(15, finalY + 75, 195, finalY + 75);

      doc.text("Class Teacher's Signature: ________________", 15, finalY + 90);
      doc.text("Principal's Signature: ________________", 15, finalY + 100);

      doc.text("Date: ________________", 130, finalY + 95);
      doc.text("School Stamp", 130, finalY + 105);

      // Footer
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      addCenteredText("This is a computer-generated document and does not require a signature", 285);

      doc.save(`${studentReportCard.studentName}_report_card.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 size={48} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12">
      <h1 className="text-3xl font-bold mb-4">Report Card Generator</h1>
      <form className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Select Form:
          </label>
          <select
            value={selectedForm}
            onChange={handleFormChange}
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white"
          >
            <option value="">Select Form</option>
            <option value="Form 1">Form 1</option>
            <option value="Form 2">Form 2</option>
            <option value="Form 3">Form 3</option>
            <option value="Form 4">Form 4</option>
          </select>
        </div>
        <div className="w-full md:w-1/2 px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Select Class:
          </label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white"
          >
            <option value="">Select Class</option>
            <option value="1A">1A</option>
            <option value="1B">1B</option>
            <option value="2A">2A</option>
            <option value="2B">2B</option>
            <option value="3A">3A</option>
            <option value="3B">3B</option>
            <option value="4A">4A</option>
            <option value="4B">4B</option>
          </select>
        </div>
      </form>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={generateReportCards}
      >
        Generate Report Cards
      </button>

      {reportCards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Generated Report Cards:</h2>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Admission Number</th>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Class</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportCards.map((reportCard, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{reportCard.admissionNumber}</td>
                  <td className="px-4 py-2">{reportCard.studentName}</td>
                  <td className="px-4 py-2">{reportCard.classLevel}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                      onClick={() => handlePreview(reportCard)}
                    >
                      Preview
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => {
                        setSelectedStudent(reportCard);
                        downloadPDF();
                      }}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{isModalOpen && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left column: School info and student details */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-3xl font-bold text-center">Example School</h2>
          <h3 className="text-xl font-semibold mb-4 text-center">"Learning is Power"</h3>
          <div className="flex flex-col items-center mb-4">
            {selectedStudent.profilePhoto && (
              <img
                src={selectedStudent.profilePhoto}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4"
              />
            )}
            <p><strong>Admission Number:</strong> {selectedStudent.admissionNumber}</p>
            <p><strong>Name:</strong> {selectedStudent.studentName}</p>
            <p><strong>Form:</strong> {selectedStudent.form}</p>
            <p><strong>Class:</strong> {selectedStudent.classLevel}</p>
          </div>
        </div>

        {/* Right column: Performance table */}
        <div className="lg:col-span-2">
          <h4 className="text-2xl font-bold mb-4">Performance</h4>
          <div className="overflow-x-auto">
            <table className="w-full mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-center">Opener</th>
                  <th className="px-4 py-2 text-center">Midterm</th>
                  <th className="px-4 py-2 text-center">Endterm</th>
                  <th className="px-4 py-2 text-center">Average Marks</th>
                  <th className="px-4 py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.subjects.map((subject, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{subject.subject}</td>
                    <td className="px-4 py-2 text-center">{subject.opener}</td>
                    <td className="px-4 py-2 text-center">{subject.midterm}</td>
                    <td className="px-4 py-2 text-center">{subject.endterm}</td>
                    <td className="px-4 py-2 text-center">{subject.averageMarks}</td>
                    <td className="px-4 py-2 text-center">{subject.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-end p-6 bg-gray-100 rounded-b-lg">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={closeModal}
        >
          Close
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={downloadPDF}
        >
          Download PDF
        </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReportCards;