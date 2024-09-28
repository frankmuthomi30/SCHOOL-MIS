import React, { useEffect, useState } from 'react';
import { ref as databaseRef, get, child } from 'firebase/database';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebase'; // Import your Firebase instances

const TimetableDisplay = () => {
  const [timetables, setTimetables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const timetablesDbRef = databaseRef(database);
        const timetableSnapshot = await get(child(timetablesDbRef, 'timetables'));
        
        if (timetableSnapshot.exists()) {
          const timetableData = {};
          const snapshotVal = timetableSnapshot.val();
          
          for (const className in snapshotVal) {
            const fileInfo = snapshotVal[className];
            try {
              const url = await getDownloadURL(storageRef(storage, fileInfo.url));
              timetableData[className] = { ...fileInfo, url };
            } catch (downloadErr) {
              console.error(`Error fetching URL for ${className}:`, downloadErr);
              timetableData[className] = { ...fileInfo, error: 'Failed to load PDF' };
            }
          }
          
          setTimetables(timetableData);
        } else {
          setError('No timetables found');
        }
      } catch (err) {
        setError('Error fetching timetables: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  if (loading) {
    return <div className="text-center">Loading timetables...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timetable Display</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(timetables).map((className) => (
          <div key={className} className="border rounded-lg p-4 shadow">
            <h3 className="text-xl font-bold mb-2">{className}</h3>
            {timetables[className].error ? (
              <p className="text-red-500">{timetables[className].error}</p>
            ) : (
              <a
                href={timetables[className].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Timetable PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableDisplay;