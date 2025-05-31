// client/src/components/clubs/EditClubModal.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';

const EditClubModal = ({ isOpen, onClose, club, onClubUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  // Add carouselImages if you want to edit them here too
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setLocation(club.location || '');
      setLogoUrl(club.logoUrl || '');
    }
  }, [club]);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const updatedData = { name, description, location, logoUrl };
      const response = await api.put(`/clubs/${club._id}`, updatedData);
      onClubUpdated(response.data); // Callback to update parent component's state
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-md bg-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900">Edit Club Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl font-bold">×</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</p>}
          <div>
            <label htmlFor="clubName" className="block text-sm font-medium text-gray-700">Club Name</label>
            <input type="text" id="clubName" value={name} onChange={(e) => setName(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="clubDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="clubDescription" value={description} rows="3" onChange={(e) => setDescription(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="clubLocation" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="clubLocation" value={location} onChange={(e) => setLocation(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input type="url" id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                   placeholder="https://example.com/logo.png"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;