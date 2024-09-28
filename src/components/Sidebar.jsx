import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Clipboard, Users, Book, Calendar, Settings, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { to: "/", icon: Home, text: "Dashboard" },
    { to: "/registration", icon: Users, text: "Students" },
    { to: "/exam-results", icon: Clipboard, text: "Marks" },
    { to: "/report-cards", icon: Book, text: "Report Cards" },
    { to: "/timetable", icon: Calendar, text: "Timetable" },
    { to: "/admin", icon: Settings, text: "Admin Section" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white h-screen w-64 fixed left-0 top-0 bottom-0 overflow-y-auto transition-transform duration-300 ease-in-out z-20
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">School Management System</h2>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.to}
                  className="flex items-center p-3 transition-colors duration-200 hover:bg-gray-700"
                  onClick={() => {
                    toggleSidebar();
                  }}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;