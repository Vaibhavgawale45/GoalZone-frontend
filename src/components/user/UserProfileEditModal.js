// client/src/components/user/UserProfileEditModal.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Modal from '../shared/Modal.js'; // Assuming you have a generic Modal component

const UserProfileEditModal = ({ isOpen, onClose, currentUserData, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', imageUrl: '',
    dob: '', experience: '', bio: '',
    position: '', skill: '', rating: '',
    newPassword: '', confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUserData) {
      setFormData({
        name: currentUserData.name || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        imageUrl: currentUserData.imageUrl || '',
        dob: currentUserData.dob ? new Date(currentUserData.dob).toISOString().split('T')[0] : '',
        experience: currentUserData.experience || '',
        bio: currentUserData.bio || '',
        position: currentUserData.role === 'Player' ? (currentUserData.position || '') : '',
        skill: currentUserData.role === 'Player' ? (currentUserData.skill || '') : '',
        rating: currentUserData.role === 'Player' ? (currentUserData.rating !== null ? String(currentUserData.rating) : '') : '',
        newPassword: '', confirmNewPassword: ''
      });
    } else { // Reset form if currentUserData is null (e.g. modal closed then reopened without new data)
        setFormData({
            name: '', email: '', phone: '', imageUrl: '', dob: '', experience: '', bio: '',
            position: '', skill: '', rating: '', newPassword: '', confirmNewPassword: ''
        });
    }
  }, [currentUserData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
        setError("New passwords do not match."); return;
    }
    
    setLoading(true);
    try {
      // Construct payload carefully, sending fields only if they have changed or are intentionally set
      const payload = {};
      // Only include fields that are different from currentUserData or are newly set
      // Or, more simply for now, send all fields and let backend decide if they are "empty" vs "cleared"

      if (formData.name !== currentUserData.name) payload.name = formData.name;
      // Email typically not changed here or through special flow
      if (formData.phone !== currentUserData.phone) payload.phone = formData.phone;
      if (formData.imageUrl !== currentUserData.imageUrl) payload.imageUrl = formData.imageUrl;
      
      // For DOB, Experience, Bio: if the form field is empty, we want to send null or an empty string
      // so the backend can potentially clear it. If it's unchanged, we might not need to send it.
      // Current backend logic `req.body.field || user.field` means if req.body.field is "", it'll use "",
      // effectively clearing it. If req.body.field is undefined, it uses user.field.

      payload.dob = formData.dob ? formData.dob : null; // Send null explicitly if empty
      payload.experience = formData.experience; // Send as is, backend handles '' or value
      payload.bio = formData.bio; // Send as is

      if (currentUserData.role === 'Player') {
        payload.position = formData.position;
        payload.skill = formData.skill;
        payload.rating = formData.rating === '' ? null : parseFloat(formData.rating);
      }
      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      console.log("[EditModal] Payload being sent:", payload); // DEBUG

      const response = await api.put('/users/profile', payload);
      setSuccess('Profile updated successfully!');
      onProfileUpdated(response.data); 
      // setTimeout(onClose, 1500); // Optional: Keep modal open to show success
    } catch (err) {
      console.error("[EditModal] Update error:", err.response || err); // DEBUG
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            {error && <p className="error-banner">{error}</p>}
            {success && <p className="success-banner">{success}</p>}

            {/* General Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><label htmlFor="edit-name" className="label-style">Full Name</label>
                 <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleChange} className="input-style" /></div>
                <div><label htmlFor="edit-email" className="label-style">Email (Cannot Change)</label>
                 <input type="email" name="email" id="edit-email" value={formData.email} className="input-style bg-gray-100 cursor-not-allowed" disabled readOnly/></div>
                <div><label htmlFor="edit-phone" className="label-style">Phone Number</label>
                 <input type="tel" name="phone" id="edit-phone" value={formData.phone} onChange={handleChange} className="input-style" /></div>
                <div><label htmlFor="edit-dob" className="label-style">Date of Birth</label>
                 <input type="date" name="dob" id="edit-dob" value={formData.dob} onChange={handleChange} className="input-style" /></div>
            </div>

            <div><label htmlFor="edit-imageUrl" className="label-style">Profile Picture URL</label>
             <input type="url" name="imageUrl" id="edit-imageUrl" value={formData.imageUrl} onChange={handleChange} className="input-style" placeholder="https://example.com/image.jpg"/></div>
            
            <div><label htmlFor="edit-experience" className="label-style">Experience</label>
             <textarea name="experience" id="edit-experience" rows="3" value={formData.experience} onChange={handleChange} className="input-style" placeholder="e.g., UEFA B License..."></textarea></div>
            
            <div><label htmlFor="edit-bio" className="label-style">Short Bio</label>
             <textarea name="bio" id="edit-bio" rows="3" value={formData.bio} onChange={handleChange} className="input-style" placeholder="A little about yourself..."></textarea></div>

            {/* Player Specific Fields (conditionally rendered based on currentUserData.role) */}
            {currentUserData.role === 'Player' && (
                <div className="pt-4 border-t mt-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Player Attributes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div><label htmlFor="edit-position" className="label-style">Position</label>
                         <input type="text" name="position" id="edit-position" value={formData.position} onChange={handleChange} className="input-style" /></div>
                        <div><label htmlFor="edit-skill" className="label-style">Primary Skill</label>
                         <input type="text" name="skill" id="edit-skill" value={formData.skill} onChange={handleChange} className="input-style" /></div>
                        <div><label htmlFor="edit-rating" className="label-style">Rating (1-5)</label>
                         <input type="number" name="rating" id="edit-rating" value={formData.rating} onChange={handleChange} className="input-style" min="0" max="5" step="0.1"/></div>
                    </div>
                </div>
            )}

            {/* Password Change Section */}
            <div className="pt-4 border-t mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Change Password (Optional)</h3>
                 <p className="text-xs text-gray-500 mb-2">Leave fields blank if you don't want to change your password.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="edit-newPassword" className="label-style">New Password</label>
                     <input type="password" name="newPassword" id="edit-newPassword" value={formData.newPassword} onChange={handleChange} className="input-style" /></div>
                    <div><label htmlFor="edit-confirmNewPassword" className="label-style">Confirm New Password</label>
                     <input type="password" name="confirmNewPassword" id="edit-confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="input-style" /></div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-5">
                <button type="button" onClick={() => { onClose(); setError(''); setSuccess('');}} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    </Modal>
  );
};
export default UserProfileEditModal;