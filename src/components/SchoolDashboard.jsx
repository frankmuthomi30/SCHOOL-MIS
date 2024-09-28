import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, ChartBar, ClipboardList, Settings, MessageCircle, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ref, query, orderByChild, limitToLast, onValue, off } from 'firebase/database';
import { database } from '../firebase'; // Import the database instance

const performanceData = [
  { year: 2010, meanGrade: 3.0, label: 'D-' },
  { year: 2011, meanGrade: 3.2, label: 'D' },
  { year: 2012, meanGrade: 3.8, label: 'D' },
  { year: 2013, meanGrade: 3.8, label: 'D' },
  { year: 2014, meanGrade: 4.0, label: 'D+' },
  { year: 2015, meanGrade: 4.2, label: 'C-' },
  { year: 2016, meanGrade: 4.1, label: 'C-' },
  { year: 2017, meanGrade: 4.6, label: 'C-' },
  { year: 2018, meanGrade: 5.0, label: 'C' },
  { year: 2019, meanGrade: 5.2, label: 'C' },
  { year: 2020, meanGrade: 5.0, label: 'C' },
  { year: 2021, meanGrade: 5.8, label: 'C+' },
  { year: 2022, meanGrade: 6.0, label: 'C+' },
  { year: 2023, meanGrade: 5.7, label: 'C+' },
];

// DashboardCard component to display key stats
const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <div className={`${color} text-white rounded-lg shadow-md p-6`}>
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <Icon className="h-4 w-4" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

// QuickAccessButton component for shortcut buttons
const SchoolDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const announcementsRef = ref(database, 'announcements');
    const recentAnnouncementsQuery = query(announcementsRef, orderByChild('timestamp'), limitToLast(5));

    const unsubscribe = onValue(recentAnnouncementsQuery, (snapshot) => {
      const fetchedAnnouncements = [];
      snapshot.forEach((childSnapshot) => {
        fetchedAnnouncements.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setAnnouncements(fetchedAnnouncements);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    });

    return () => off(recentAnnouncementsQuery);
  }, []);

  const handleChartClick = (data) => {
    if (data?.activePayload) {
      setSelectedYear(data.activePayload[0].payload.year);
    }
  };

  const calculateCountdown = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry - now;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days < 0) return { text: 'Expired', color: 'text-red-600' };
    if (days === 0 && hours === 0) return { text: 'Expires today', color: 'text-red-600' };
    if (days === 0) return { text: `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`, color: 'text-red-600' };
    if (days <= 2) return { text: `${days} day${days !== 1 ? 's' : ''} remaining`, color: 'text-red-500' };
    if (days <= 5) return { text: `${days} days remaining`, color: 'text-yellow-500' };
    return { text: `${days} days remaining`, color: 'text-green-500' };
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="flex-grow p-8 transition-all duration-300">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">School Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard title="Total Students" value="1,234" icon={Users} color="bg-blue-600" />
          <DashboardCard title="Total Classes" value="8" icon={BookOpen} color="bg-green-600" />
          <DashboardCard title="Total Teachers" value="23" icon={Calendar} color="bg-yellow-500" />
        </div>


        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Announcements</h2>
          {loading ? (
            <p>Loading announcements...</p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((announcement) => {
                const countdown = announcement.useCountdown ? calculateCountdown(announcement.expiryDate) : null;
                return (
                  <li key={announcement.id} className="border-b pb-4">
                    <div className="flex items-center justify-between text-gray-700 mb-2">
                      <div className="flex items-center">
                        <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{announcement.title}</span>
                      </div>
                      {countdown && (
                        <div className={`flex items-center text-sm ${countdown.color}`}>
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{countdown.text}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{announcement.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {announcement.timestamp && new Date(announcement.timestamp).toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">KNEC Exam Performance (2010-2023)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" domain={[2, 7]} tickCount={6} />
                <YAxis yAxisId="right" orientation="right" dataKey="label" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="meanGrade" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {selectedYear && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8" role="alert">
            <p className="font-bold">Performance Details for {selectedYear}</p>
            <p>
              Mean Grade: {performanceData.find((d) => d.year === selectedYear).meanGrade.toFixed(1)} (
              {performanceData.find((d) => d.year === selectedYear).label})
            </p>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default SchoolDashboard;