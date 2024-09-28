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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Simulated loading time
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
          {/* Mobile toggle button */}
          <button
            className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? 'Close' : 'Menu'}
          </button>
          <div className="p-4 lg:p-8">
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
      </div>
    </Router>
  );
}