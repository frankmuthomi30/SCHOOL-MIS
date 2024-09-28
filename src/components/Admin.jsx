import React from 'react';
import { Upload, Bell, UserPlus } from 'lucide-react';
import UploadTimetable from './UploadTimetable';
import Announcement from './Announcement';
import StudentRegistration from './StudentRegistration';

const AdminSection = () => {
  const sections = [
    {
      title: 'Upload Timetable',
      icon: Upload,
      color: 'blue',
      component: UploadTimetable
    },
    {
      title: 'Manage Announcements',
      icon: Bell,
      color: 'green',
      component: Announcement
    },
    {
      title: 'Student Registration',
      icon: UserPlus,
      color: 'red',
      component: StudentRegistration
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section, index) => (
          <SectionCard key={index} {...section} />
        ))}
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, color, component: Component }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className={`bg-${color}-600 p-4 flex items-center`}>
      <Icon className="text-white mr-2" size={24} />
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
    </div>
    <div className="p-6">
      <Component />
    </div>
  </div>
);

export default AdminSection;