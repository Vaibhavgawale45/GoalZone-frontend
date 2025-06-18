// client/src/components/user/UserProfileEditModal.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Removed Controller as it wasn't used here
import api from '../../services/api.js';
// import { toast } from 'react-toastify';

// Assuming these are correctly imported from your iconUtils.js
import { XMarkIcon, ArrowUpTrayIcon } from '../../utils/iconUtils.js'; 

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const UserProfileEditModal = ({ isOpen, onClose, currentUserData, onProfileUpdated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    defaultValues: {
      name: currentUserData.name || '',
      phone: currentUserData.phone || '',
      dob: currentUserData.dob ? new Date(currentUserData.dob).toISOString().split('T')[0] : '',
      bio: currentUserData.bio || '',
      experience: currentUserData.experience || '',
      position: currentUserData.position || '',
      skill: currentUserData.skill || '',
      jerseyNumber: currentUserData.jerseyNumber || '', // <<<< ADDED jerseyNumber to defaultValues
    }
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(currentUserData.imageUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && currentUserData) { // Ensure currentUserData is available before resetting
        reset({
        name: currentUserData.name || '',
        phone: currentUserData.phone || '',
        dob: currentUserData.dob ? new Date(currentUserData.dob).toISOString().split('T')[0] : '',
        bio: currentUserData.bio || '',
        experience: currentUserData.experience || '',
        position: currentUserData.position || '',
        skill: currentUserData.skill || '',
        jerseyNumber: currentUserData.jerseyNumber || '', // <<<< ADDED jerseyNumber to reset
        });
        setImagePreviewUrl(currentUserData.imageUrl || '');
        setSelectedFile(null);
        setErrorMessage('');
    }
  }, [currentUserData, reset, isOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setErrorMessage("Image file size should not exceed 5MB.");
            return;
        }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(currentUserData.imageUrl || '');
    }
  };

  const onSubmit = async (data) => {
    setErrorMessage('');
    let finalImageUrl = imagePreviewUrl.startsWith('data:') ? null : imagePreviewUrl; // If it's a data URL, it's a new preview to be uploaded or current if no new file

    if (selectedFile) {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        setErrorMessage("Image upload configuration is missing.");
        return;
      }
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const cloudinaryData = await response.json();
        if (cloudinaryData.secure_url) {
          finalImageUrl = cloudinaryData.secure_url;
        } else {
          throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
        }
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        setErrorMessage(error.message || "Failed to upload image.");
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    } else if (imagePreviewUrl === '' && currentUserData.imageUrl) {
        // This case means user might have cleared the preview of an existing image, intending to remove it
        finalImageUrl = ''; // Send empty string to backend to signify removal
    }


    const profileUpdateData = {
      name: data.name,
      phone: data.phone,
      dob: data.dob,
      bio: data.bio,
      experience: data.experience,
      imageUrl: finalImageUrl,
      jerseyNumber: data.jerseyNumber || null, // <<<< ADDED jerseyNumber to payload (send null if empty)
    };
    
    if (currentUserData.role === 'Player') {
        profileUpdateData.position = data.position;
        profileUpdateData.skill = data.skill;
        // Score and payment details are typically updated by coach/admin, not player in their own profile edit
    }

    try {
      const response = await api.put('/users/profile', profileUpdateData);
      onProfileUpdated(response.data); // This should return the full updated user object
      onClose();
    } catch (err) {
      console.error("Profile Update Error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update profile.");
    }
  };

  if (!isOpen) return null;

  // Consistent Input and Button Styles
  const inputBaseStyle = "w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 text-base";
  const inputNormalStyle = `${inputBaseStyle} border-slate-300 placeholder-slate-400`;
  const inputErrorStyle = `${inputBaseStyle} border-red-500 ring-1 ring-red-500`;
  const btnPrimary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnOutlineSm = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-700 bg-white rounded-md hover:bg-sky-50 border border-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors shadow-sm";


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-5"> {/* Adjusted space-y for a bit more room */}
            {errorMessage && (
              <div className="p-3.5 mb-4 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col items-center space-y-3.5">
                <img 
                    src={imagePreviewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserData.name || 'U')}&size=128&background=EBF4FF&color=3B82F6`} 
                    alt="Profile Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 shadow-md" 
                />
                <label htmlFor="profileImageUpload" className={btnOutlineSm}>
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    {selectedFile ? "Change Image" : "Upload New Image"}
                </label>
                <input 
                    type="file" 
                    id="profileImageUpload" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    className="hidden"
                    onChange={handleFileChange}
                />
                {selectedFile && <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>}
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                id="name"
                {...register("name", { required: "Name is required" })} 
                className={errors.name ? inputErrorStyle : inputNormalStyle}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            {/* Jersey Number Field - Placed near name or player-specific details */}
            {currentUserData.role === 'Player' && ( // Only show for players
                 <div>
                    <label htmlFor="jerseyNumber" className="block text-sm font-medium text-slate-700 mb-1.5">Jersey Number</label>
                    <input 
                        type="text" // Use text to allow "00", "0", etc. Backend can validate if numeric only.
                        id="jerseyNumber"
                        {...register("jerseyNumber")} 
                        className={inputNormalStyle}
                        placeholder="e.g., 10 or 00"
                    />
                    {/* Add error display for jerseyNumber if backend validation sends it */}
                </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                {...register("phone")} 
                className={inputNormalStyle}
                placeholder="Your contact number"
              />
            </div>
            
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
              <input 
                type="date" 
                id="dob"
                {...register("dob")} 
                className={inputNormalStyle}
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-1.5">Experience</label>
              <input 
                type="text" 
                id="experience"
                {...register("experience")} 
                className={inputNormalStyle}
                placeholder="e.g., 5 years amateur, 2 years semi-pro"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
              <textarea 
                id="bio"
                rows="3" // Slightly less rows for compactness
                {...register("bio")} 
                className={`${inputNormalStyle} min-h-[60px]`}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            {/* Player Specific Fields (Position, Skill) */}
            {currentUserData.role === 'Player' && (
              <>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
                  <input 
                    type="text" 
                    id="position"
                    {...register("position")} 
                    className={inputNormalStyle}
                    placeholder="e.g., Striker, Midfielder"
                  />
                </div>
                <div>
                  <label htmlFor="skill" className="block text-sm font-medium text-slate-700 mb-1.5">Primary Skill</label>
                  <input 
                    type="text" 
                    id="skill"
                    {...register("skill")} 
                    className={inputNormalStyle}
                    placeholder="e.g., Dribbling, Passing"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting || uploadingImage}
              className={`${btnSecondary} w-full sm:w-auto`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || uploadingImage}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {isSubmitting || uploadingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {uploadingImage ? 'Uploading...' : 'Saving...'}
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserProfileEditModal;