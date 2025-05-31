// client/src/components/coach/EditCoachProfileModal.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Modal from '../shared/Modal.js'; // Assuming generic Modal component

const EditCoachProfileModal = ({ isOpen, onClose, coachData, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', imageUrl: '',
    dateOfBirth: '', workSpecialty: '', experienceYears: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coachData) {
      setFormData({
        name: coachData.name || '',
        email: coachData.email || '', // Email editing might have different implications/UX
        phone: coachData.phone || '',
        imageUrl: coachData.imageUrl || '',
        dateOfBirth: coachData.dateOfBirth ? new Date(coachData.dateOfBirth).toISOString().split('T')[0] : '', // Format for <input type="date">
        workSpecialty: coachData.workSpecialty || '',
        experienceYears: coachData.experienceYears || ''
      });
    }
  }, [coachData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Prepare data, convert empty strings to undefined for optional fields if needed
      const payload = { ...formData };
      if (payload.experienceYears === '') payload.experienceYears = null; else payload.experienceYears = Number(payload.experienceYears);
      if (payload.dateOfBirth === '') payload.dateOfBirth = null;

      console.log("[EditCoachProfileModal] Submitting:", payload);
      const response = await api.put('/users/profile', payload); // Backend updates current user's profile
      console.log("[EditCoachProfileModal] Update response:", response.data);
      onProfileUpdated(response.data); // Update AuthContext and parent component
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="error-banner">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-style">Full Name*</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /></div>
            <div><label className="label-style">Email*</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-style" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-style">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-style" /></div>
            <div><label className="label-style">Profile Image URL</label><input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="input-style" placeholder="https://..." /></div>
        </div>
        <div><label className="label-style">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-style" /></div>
        <div><label className="label-style">Work Specialty / Focus</label><input type="text" name="workSpecialty" value={formData.workSpecialty} onChange={handleChange} className="input-style" placeholder="e.g., Youth Development" /></div>
        <div><label className="label-style">Years of Experience</label><input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} min="0" className="input-style" /></div>

        <div className="flex justify-end space-x-3 pt-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default EditCoachProfileModal;