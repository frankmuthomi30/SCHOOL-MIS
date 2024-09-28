import React, { useState } from 'react';
import { database, storage } from '../firebase'; // Ensure you import your Firebase config
import { ref, set, remove } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';

const Timetable = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableFile, setTimetableFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleFileUpload = (event) => {
    setTimetableFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedClass || !timetableFile) {
      setUploadError('Please select a class and upload a file.');
      return;
    }

    const storagePath = `timetables/${selectedClass}/${timetableFile.name}`;
    const fileRef = storageRef(storage, storagePath);

    try {
      await uploadBytes(fileRef, timetableFile);
      const downloadURL = await getDownloadURL(fileRef);

      // Save the download URL to the database
      await set(ref(database, `timetables/${selectedClass}`), {
        fileName: timetableFile.name,
        url: downloadURL,
      });

      setUploadSuccess('Timetable uploaded successfully!');
      setUploadError('');
      setTimetableFile(null); // Reset file input
    } catch (error) {
      setUploadError('Error uploading timetable: ' + error.message);
      setUploadSuccess('');
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) {
      setUploadError('Please select a class to delete the timetable.');
      return;
    }

    try {
      // Remove timetable from database
      await remove(ref(database, `timetables/${selectedClass}`));
      
      // Remove file from storage
      const fileRef = storageRef(storage, `timetables/${selectedClass}/${timetableFile.name}`);
      await remove(fileRef);

      setUploadSuccess('Timetable deleted successfully!');
      setUploadError('');
      setTimetableFile(null); // Reset file input
    } catch (error) {
      setUploadError('Error deleting timetable: ' + error.message);
      setUploadSuccess('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Timetable</h2>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="class-select">
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={handleClassChange}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="">-- Select Class --</option>
          <option value="form1A">Form 1A</option>
          <option value="form1B">Form 1B</option>
          <option value="form2A">Form 2A</option>
          <option value="form2B">Form 2B</option>
          <option value="form3A">Form 3A</option>
          <option value="form3B">Form 3B</option>
          <option value="form4A">Form 4A</option>
          <option value="form4B">Form 4B</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="timetable-upload">
          Upload Timetable PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          id="timetable-upload"
          onChange={handleFileUpload}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-colors mr-2"
      >
        Upload Timetable
      </button>

      <button
        onClick={handleDelete}
        className="bg-red-500 text-white rounded p-2 hover:bg-red-600 transition-colors"
      >
        Delete Timetable
      </button>

      {uploadSuccess && (
        <div className="mt-4 text-green-600 font-semibold">
          {uploadSuccess}
        </div>
      )}

      {uploadError && (
        <div className="mt-4 text-red-600 font-semibold">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default Timetable;
