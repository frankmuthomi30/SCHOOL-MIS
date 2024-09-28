import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StudentRegistration from './components/StudentRegistration';
import TeacherDashboard from './components/TeacherDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import TimeTabledisplay from './components/TimeTabledisplay';
import Admin from './components/Admin';
import StudentReportCards from './components/StudentReportCards';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Simulated loading time
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <p className="mt-2 text-4xl font-semibold text-gray-800">St. Anthony High School</p>
        <p className="mt-4 text-lg font-semibold text-blue-600">Please Wait!...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <Sidebar />
        <div className="flex-1 overflow-auto ml-64">
          <Routes>
            <Route path="/" element={<SchoolDashboard />} />
            <Route path="/registration" element={<StudentRegistration />} />
            <Route path="/exam-results" element={<TeacherDashboard />} />
            <Route path="/report-cards" element={<StudentReportCards />} />
            <Route path="/timetable" element={<TimeTabledisplay />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}