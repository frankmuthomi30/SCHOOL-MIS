import React, { useState, useRef, useEffect } from "react";
import { ref, push, set, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from '../firebase.js';

const generateAdmissionNumber = (name, form, year) => {
  const namePrefix = name.length >= 2 ? name.substring(0, 2).toUpperCase() : 'XX';
  const yearSuffix = year.toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${namePrefix}${form}${yearSuffix}-${randomNum}`;
};

const getRandomClass = (form) => {
  const classSuffixes = {
    'Form 1': ['A', 'B', 'C'],
    'Form 2': ['A', 'B', 'C'],
    'Form 3': ['A', 'B', 'C'],
    'Form 4': ['A', 'B', 'C'],
  };
  const suffixes = classSuffixes[form] || ['X'];
  return `${form.split(' ')[1]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    form: "",
    classLevel: "",
    parentContact: "",
    gender: "",
    dateOfBirth: "",
  });
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'form') {
      const randomClass = getRandomClass(value);
      setFormData((prevData) => ({ 
        ...prevData, 
        [name]: value,
        classLevel: randomClass
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPassportPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setErrorMessage("Please select a valid image file.");
    }
  };

  const handleCameraToggle = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setErrorMessage("Error accessing camera. Please try uploading an image instead.");
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], "passport_photo.jpg", { type: "image/jpeg" });
        setPassportPhoto(file);
        setPreviewUrl(URL.createObjectURL(file));
        handleCameraToggle(); // Turn off the camera after capturing
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Check if all form fields are filled
    const isFormFilled = Object.values(formData).every(value => value !== "");

    if (!isFormFilled) {
      setErrorMessage("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (!passportPhoto) {
      setErrorMessage("Please capture or upload a passport photo.");
      setIsLoading(false);
      return;
    }

    const currentYear = new Date().getFullYear();
    const admissionNumber = generateAdmissionNumber(formData.name, formData.form.slice(-1), currentYear);

    try {
      // Upload passport photo
      const photoRef = storageRef(storage, `passport_photos/${admissionNumber}`);
      await uploadBytes(photoRef, passportPhoto);
      const photoURL = await getDownloadURL(photoRef);

      // Prepare student data with photo URL and all form fields
      const studentData = {
        ...formData,
        admissionNumber,
        photoURL,
        dateAdmitted: new Date().toISOString(),
      };

      // Save student data to database
      const newStudentRef = push(ref(database, "students"));
      await set(newStudentRef, studentData);

      setSuccessMessage(`Student admitted successfully! Admission Number: ${admissionNumber}`);
      setErrorMessage("");
      
      // Fetch the newly created student profile
      const studentSnapshot = await get(newStudentRef);
      if (studentSnapshot.exists()) {
        setStudentProfile(studentSnapshot.val());
      }

      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Error: " + error.message);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      form: "",
      classLevel: "",
      parentContact: "",
      gender: "",
      dateOfBirth: "",
    });
    setPassportPhoto(null);
    setPreviewUrl(null);
    setStudentProfile(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Student Registration</h2>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Student Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label htmlFor="form" className="block text-sm font-medium text-gray-700">Form Level</label>
            <select
              id="form"
              name="form"
              value={formData.form}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Form</option>
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
            </select>
          </div>

          <div>
            <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700">Assigned Class</label>
            <input
              type="text"
              id="classLevel"
              name="classLevel"
              value={formData.classLevel}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Class will be assigned automatically"
            />
          </div>

          <div>
            <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">Parent Contact</label>
            <input
              type="text"
              id="parentContact"
              name="parentContact"
              value={formData.parentContact}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter parent contact"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Passport Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Select Photo
            </button>
            <button
              type="button"
              onClick={handleCameraToggle}
              className={`px-4 py-2 ${isCameraOn ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            </button>
            {isCameraOn && (
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Capture Photo
              </button>
            )}
          </div>
          <div className="mt-2">
            <video 
              ref={videoRef} 
              style={{ display: isCameraOn ? 'block' : 'none' }} 
              width="320" 
              height="240" 
              autoPlay 
              playsInline
            />
            {previewUrl && (
              <img src={previewUrl} alt="Passport preview" className="mt-2 max-w-xs" />
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register Student'}
        </button>
      </form>

      {isDialogOpen && studentProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Welcome to Our School!</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {studentProfile.name}, you have been successfully admitted.
                </p>
                <p className="text-sm text-gray-500">
                  Admission Number: {studentProfile.admissionNumber}
                </p>
                <p className="text-sm text-gray-500">
                  Form: {studentProfile.form}
                </p>
                <p className="text-sm text-gray-500">
                  Class: {studentProfile.classLevel}
                </p>
                <p className="text-sm text-gray-500">
                  Parent Contact: {studentProfile.parentContact}
                </p>
                <p className="text-sm text-gray-500">
                  Gender: {studentProfile.gender}
                </p>
                <p className="text-sm text-gray-500">
                  Date of Birth: {studentProfile.dateOfBirth}
                </p>
                {studentProfile.photoURL && (
                  <img src={studentProfile.photoURL} alt="Student Photo" className="mt-2 mx-auto max-w-xs" />
                )}
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Close
                </button>
              </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;