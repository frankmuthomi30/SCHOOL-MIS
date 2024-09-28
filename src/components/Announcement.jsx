import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { Edit, Trash, Clock } from 'lucide-react';
import { database } from '../firebase';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [useCountdown, setUseCountdown] = useState(false);
  const [countdownDays, setCountdownDays] = useState(2);

  useEffect(() => {
    const announcementsRef = ref(database, 'announcements');
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      const fetchedAnnouncements = [];
      snapshot.forEach((childSnapshot) => {
        fetchedAnnouncements.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setAnnouncements(fetchedAnnouncements);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const announcementData = {
      title,
      content,
      timestamp: new Date().toISOString(),
      useCountdown,
      countdownDays: useCountdown ? countdownDays : null,
      expiryDate: useCountdown ? new Date(Date.now() + countdownDays * 24 * 60 * 60 * 1000).toISOString() : null,
    };

    try {
      if (editingId) {
        await set(ref(database, `announcements/${editingId}`), announcementData);
      } else {
        const newAnnouncementRef = push(ref(database, 'announcements'));
        await set(newAnnouncementRef, announcementData);
      }
      resetForm();
    } catch (error) {
      console.error('Error with announcement:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setUseCountdown(false);
    setCountdownDays(2);
  };

  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setEditingId(announcement.id);
    setUseCountdown(announcement.useCountdown || false);
    setCountdownDays(announcement.countdownDays || 2);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(database, `announcements/${id}`));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {editingId ? 'Edit Announcement' : 'Post New Announcement'}
      </h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useCountdown}
              onChange={(e) => setUseCountdown(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm font-bold">Use Countdown</span>
          </label>
        </div>
        {useCountdown && (
          <div className="mb-4">
            <label htmlFor="countdownDays" className="block text-gray-700 text-sm font-bold mb-2">Countdown Days</label>
            <input
              type="number"
              id="countdownDays"
              value={countdownDays}
              onChange={(e) => setCountdownDays(parseInt(e.target.value))}
              min="1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {editingId ? 'Update Announcement' : 'Post Announcement'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel Edit
          </button>
        )}
      </form>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Announcements</h3>
      <ul className="space-y-4">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="border-b pb-4">
            <div className="flex items-center justify-between text-gray-700 mb-2">
              <span className="font-semibold">{announcement.title}</span>
              <div>
                <button onClick={() => handleEdit(announcement)} className="text-blue-500 hover:text-blue-700 mr-2">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(announcement.id)} className="text-red-500 hover:text-red-700">
                  <Trash size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-600">{announcement.content}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="mr-4">Posted: {announcement.timestamp && new Date(announcement.timestamp).toLocaleString()}</span>
              {announcement.useCountdown && (
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  Expires: {announcement.expiryDate && new Date(announcement.expiryDate).toLocaleString()}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnnouncementManagement;