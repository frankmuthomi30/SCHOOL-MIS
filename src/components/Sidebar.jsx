import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Clipboard, Users, Book, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="bg-gray-800 text-white h-screen w-64 fixed left-0 top-0 bottom-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">School Management System</h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/registration" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Users className="mr-2 h-5 w-5" />
              Students
            </Link>
          </li>
          <li>
            <Link to="/exam-results" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Clipboard className="mr-2 h-5 w-5" />
              Marks
            </Link>
          </li>
          <li>
            <Link to="/report-cards" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Book className="mr-2 h-5 w-5" />
              Report Cards
            </Link>
          </li>
          <li>
            <Link to="/timetable" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Calendar className="mr-2 h-5 w-5" />
              Timetable
            </Link>
          </li>
          <li>
            <Link to="/admin" className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700">
              <Settings className="mr-2 h-5 w-5" />
              Admin Section
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;