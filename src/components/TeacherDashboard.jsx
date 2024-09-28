import React, { useState, useCallback, useMemo } from 'react';
import { ref, get, set, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase.js';

// Reusable Select Input Component
const SelectInput = React.memo(({ label, value, onChange, options }) => (
  <div>
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={label}>
      {label}
    </label>
    <select
      id={label}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      value={value}
      onChange={onChange}
      aria-label={label}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
));

const FeedbackModal = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded p-5 shadow-lg">
      <h2 className="text-lg font-bold mb-2">Feedback</h2>
      <p>{message}</p>
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

const ConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded p-5 shadow-lg">
      <h2 className="text-lg font-bold mb-2">Confirm Submission</h2>
      <p>Are you sure you want to submit the marks?</p>
      <div className="mt-4 flex justify-end">
        <button
          className="mr-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [department, setDepartment] = useState('');
  const [form, setForm] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [marks, setMarks] = useState('');
  const [examType, setExamType] = useState('');
  const [term, setTerm] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const departments = useMemo(() => ['Mathematics', 'English','Kiswahili','Chemistry','Physics','Biology', 'Agriculture', 'History','Geograpghy','Cre'], []);
  const forms = useMemo(() => ['Form 1', 'Form 2', 'Form 3', 'Form 4'], []);
  const classLevels = useMemo(() => ['A', 'B'], []);
  const terms = useMemo(() => {
    const month = new Date().getMonth() + 1; // January is 1
    if (month >= 1 && month <= 3) return ['Term 1'];
    if (month >= 5 && month <= 7) return ['Term 2'];
    if (month >= 9 && month <= 11) return ['Term 3'];
    return [];
  }, []);
  const examTypes = useMemo(() => ['Opener', 'CAT-1', 'CAT-2', 'CAT-3', 'Midterm', 'Endterm'], []);

  const searchStudent = useCallback(async () => {
    setIsLoading(true);
    setMessage('');
    setStudentInfo(null);
    setSearchResults([]);

    if (!form || !classLevel) {
      setMessage('Please select form and class level before searching.');
      setIsLoading(false);
      return;
    }

    try {
      const studentsRef = ref(database, 'students');
      const studentQuery = query(
        studentsRef, 
        orderByChild('classLevel'),
        equalTo(`${form.slice(-1)}${classLevel}`)
      );
      const snapshot = await get(studentQuery);

      if (snapshot.exists()) {
        const studentsData = snapshot.val();
        const filteredStudents = Object.entries(studentsData)
          .filter(([_, student]) => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admissionNumber.includes(searchTerm)
          )
          .map(([id, student]) => ({ id, ...student }));

        setSearchResults(filteredStudents);

        if (filteredStudents.length === 1) {
          setStudentInfo(filteredStudents[0]);
        } else if (filteredStudents.length > 1) {
          setMessage(`Found ${filteredStudents.length} students. Please select one.`);
        } else {
          setMessage('No students found matching the search term.');
        }
      } else {
        setMessage('No students found in this class.');
      }
    } catch (error) {
      console.error('Error searching for student:', error);
      setMessage('Error searching for student: ' + error.message);
    }
    setIsLoading(false);
  }, [form, classLevel, searchTerm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!studentInfo) {
      setMessage('Please search for a valid student first');
      return;
    }
    if (!marks || !examType || !term) {
      setMessage('Please enter marks, select exam type, and term');
      return;
    }

    // Check if the exam type has already been recorded for the current term
    const resultsRef = ref(database, `examResults/${department.toLowerCase()}/${studentInfo.admissionNumber}/${term.toLowerCase()}`);
    const existingSnapshot = await get(query(resultsRef, orderByChild('examType'), equalTo(examType)));

    if (existingSnapshot.exists()) {
      setMessage(`Marks for ${examType} have already been submitted for this term.`);
      return;
    }

    setShowConfirmationModal(true); // Show confirmation modal instead of confirming directly
  }, [studentInfo, marks, examType, term, department]);

  const confirmSubmit = useCallback(async () => {
    const resultsRef = ref(database, `examResults/${department.toLowerCase()}/${studentInfo.admissionNumber}/${term.toLowerCase()}`);
    const newResult = {
      examType,
      marks: Number(marks),
      timestamp: Date.now(),
      form: studentInfo.form,
      classLevel: studentInfo.classLevel,
    };

    try {
      await set(push(resultsRef), newResult);
      setFeedbackMessage('Exam results saved successfully');
      setShowFeedbackModal(true);
      setSearchTerm('');
      setStudentInfo(null);
      setMarks('');
      setExamType('');
      setTerm('');
      setSearchResults([]);
    } catch (error) {
      setMessage('Error saving exam results: ' + error.message);
    }
    setShowConfirmationModal(false); // Close confirmation modal after submission
  }, [department, studentInfo, examType, marks, term]);

  const closeModal = () => {
    setShowFeedbackModal(false);
    setFeedbackMessage('');
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false); // Close confirmation modal without submission
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
      <div className="mb-6 grid grid-cols-3 gap-4">
        <SelectInput 
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          options={departments}
        />
        <SelectInput 
          label="Form"
          value={form}
          onChange={(e) => setForm(e.target.value)}
          options={forms}
        />
        <SelectInput 
          label="Class Level"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          options={classLevels}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentSearch">
          Search Student
        </label>
        <div className="flex">
          <input
            id="studentSearch"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter student name or admission number"
          />
          <button
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={searchStudent}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {message && <p className="text-red-500">{message}</p>}

      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Search Results:</h2>
          <ul className="list-disc pl-5">
            {searchResults.map((student) => (
              <li key={student.id} onClick={() => setStudentInfo(student)} className="cursor-pointer hover:underline">
                {student.name} - {student.admissionNumber}
              </li>
            ))}
          </ul>
        </div>
      )}

      {studentInfo && (
        <div className="mb-6">
          <h2 className="text-lg font-bold">Selected Student:</h2>
          <p>Name: {studentInfo.name}</p>
          <p>Admission Number: {studentInfo.admissionNumber}</p>
          <p>Form: {studentInfo.form}</p>
          <p>Class Level: {studentInfo.classLevel}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="marks">
            Marks
          </label>
          <input
            id="marks"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="Enter Marks"
            required
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <SelectInput 
            label="Exam Type"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            options={examTypes}
          />
          <SelectInput 
            label="Term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            options={terms}
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit Marks
        </button>
      </form>

      {showFeedbackModal && (
        <FeedbackModal message={feedbackMessage} onClose={closeModal} />
      )}

      {showConfirmationModal && (
        <ConfirmationModal onConfirm={confirmSubmit} onCancel={handleCancelConfirmation} />
      )}
    </div>
  );
};

export default TeacherDashboard;
