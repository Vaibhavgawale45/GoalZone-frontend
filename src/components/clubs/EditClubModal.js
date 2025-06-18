// client/src/components/clubs/EditClubModal.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
// import { toast } from 'react-toastify'; 

// --- Import Icons from the utility file ---
import { 
    XMarkIcon, 
    ArrowUpTrayIcon, 
    PhotoIcon, // Correctly importing the component created by createIcon
    TrashIcon  // Correctly importing the component created by createIcon
} from '../../utils/iconUtils.js'; // Adjust path if your utils folder is elsewhere
// --- End Icon Imports ---


const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const EditClubModal = ({ isOpen, onClose, club, onClubUpdated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting: formIsSubmitting }, reset } = useForm({
    defaultValues: {
      name: club?.name || '',
      description: club?.description || '',
      location: club?.location || '',
    }
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(club?.logoUrl || '');
  const [carouselFiles, setCarouselFiles] = useState([]);
  const [carouselPreviews, setCarouselPreviews] = useState(
    club?.carouselImages?.map(url => ({ url, isNew: false })) || [] // Ensure consistent structure
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && club) {
      reset({
        name: club.name || '',
        description: club.description || '',
        location: club.location || '',
      });
      setLogoPreview(club.logoUrl || '');
      setCarouselPreviews(club.carouselImages?.map(url => ({ url, isNew: false })) || []);
      setLogoFile(null);
      setCarouselFiles([]);
      setErrorMessage('');
    }
  }, [club, reset, isOpen]);

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Logo file size should not exceed 5MB.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleCarouselFilesChange = (event) => {
    const files = Array.from(event.target.files);
    const MAX_CAROUSEL_IMAGES = 5;
    
    // Calculate how many new images can be added
    const existingImageCount = carouselPreviews.filter(p => !p.isNew).length;
    const newFilesAlreadyStagedCount = carouselFiles.length;
    const slotsAvailable = MAX_CAROUSEL_IMAGES - existingImageCount - newFilesAlreadyStagedCount;

    if (files.some(file => file.size > 5 * 1024 * 1024)) {
        setErrorMessage('Each banner image size should not exceed 5MB.');
        return;
    }
    if (files.length > slotsAvailable) {
        setErrorMessage(`You can only add ${slotsAvailable} more image(s). Max ${MAX_CAROUSEL_IMAGES} total.`);
        // Optionally, only take the allowed number of files:
        // files = files.slice(0, slotsAvailable);
        // if (files.length === 0) return; // No files to add after slicing
        return; 
    }

    if (files.length > 0) {
      setCarouselFiles(prevFiles => [...prevFiles, ...files]);
      const newPreviews = files.map(file => ({ url: URL.createObjectURL(file), isNew: true, fileRef: file }));
      setCarouselPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
      setErrorMessage('');
    }
  };
  
  const removeCarouselImage = (indexToRemove) => {
    const previewToRemove = carouselPreviews[indexToRemove];
    if (previewToRemove.isNew && previewToRemove.fileRef) { 
        setCarouselFiles(prevFiles => prevFiles.filter(f => f !== previewToRemove.fileRef));
    }
    setCarouselPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const uploadToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing.");
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || 'Cloudinary upload failed for a file.');
    }
  };

  const onSubmitHandler = async (data) => {
    setImageUploading(true); 
    setErrorMessage('');
    
    let finalLogoUrl = logoPreview; // Start with current preview
    if (logoFile) { // If a new file was selected, logoPreview is a data URL
        finalLogoUrl = await uploadToCloudinary(logoFile);
    } else if (!logoPreview && club?.logoUrl) { // If preview was cleared and there was an original URL
        finalLogoUrl = ''; // Indicate removal
    } else if (!logoPreview && !club?.logoUrl) {
        finalLogoUrl = ''; // No logo initially, no new one uploaded
    }
    // If logoPreview is an existing http URL and no new logoFile, it's already finalLogoUrl


    // Filter existing URLs and map new files to upload promises
    const existingUrls = carouselPreviews.filter(p => !p.isNew).map(p => p.url);
    const newFilesToUpload = carouselPreviews.filter(p => p.isNew && p.fileRef).map(p => p.fileRef);
    let uploadedNewCarouselUrls = [];

    if (newFilesToUpload.length > 0) {
      uploadedNewCarouselUrls = await Promise.all(
        newFilesToUpload.map(file => uploadToCloudinary(file))
      );
    }
    const finalCarouselUrls = [...existingUrls, ...uploadedNewCarouselUrls];
    
    setImageUploading(false); 

    const clubUpdateData = {
      ...data,
      logoUrl: finalLogoUrl,
      carouselImages: finalCarouselUrls,
    };

    try {
      const response = await api.put(`/clubs/${club._id}`, clubUpdateData);
      onClubUpdated(response.data);
      onClose();
    } catch (err) {
      console.error("Error updating club:", err);
      setErrorMessage(err.message || "Failed to update club. Please try again.");
      setImageUploading(false);
    }
  };

  const isSubmitting = formIsSubmitting || imageUploading;

  if (!isOpen) return null;

  const inputBaseStyle = "w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 text-base";
  const inputNormalStyle = `${inputBaseStyle} border-slate-300 placeholder-slate-400`;
  const inputErrorStyle = `${inputBaseStyle} border-red-500 ring-1 ring-red-500`;
  const btnPrimary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnOutlineSm = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-700 bg-white rounded-md hover:bg-sky-50 border border-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors shadow-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800">Edit {club?.name || 'Club'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-6">
            {errorMessage && <p className="p-3 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg">{errorMessage}</p>}

            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-slate-700 mb-1.5">Club Name</label>
              <input type="text" id="clubName" {...register("name", { required: "Club name is required" })}
                className={errors.name ? inputErrorStyle : inputNormalStyle} placeholder="Enter club name" />
              {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name.message}</p>}
            </div>
            
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea id="description" rows="4" {...register("description")}
                className={`${inputNormalStyle} min-h-[80px]`} placeholder="Tell us about the club..." />
            </div>

             <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input type="text" id="location" {...register("location")}
                className={inputNormalStyle} placeholder="e.g., City, State" />
            </div>

            <div className="pt-2 space-y-3">
              <label className="block text-sm font-medium text-slate-700">Club Logo</label>
              <div className="flex items-end gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-28 h-28 rounded-lg object-cover border-2 border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-28 h-28 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <PhotoIcon /> {/* Ensure PhotoIcon is correctly defined/imported */}
                  </div>
                )}
                <label htmlFor="logoUpload" className={`cursor-pointer ${btnOutlineSm}`}>
                  <ArrowUpTrayIcon className="w-4 h-4" /> {logoFile || (club?.logoUrl && logoPreview === club.logoUrl) ? 'Change' : 'Upload'}
                </label>
                <input type="file" id="logoUpload" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleLogoFileChange} />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="block text-sm font-medium text-slate-700">Banner/Carousel Images (up to 5)</label>
              <label htmlFor="carouselUpload" className={`cursor-pointer ${btnOutlineSm} w-full sm:w-auto justify-center`}>
                <ArrowUpTrayIcon className="w-4 h-4" /> Add Banner Images
              </label>
              <input type="file" id="carouselUpload" accept="image/png, image/jpeg, image/jpg, image/webp" multiple className="hidden" onChange={handleCarouselFilesChange} />
              
              {carouselPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {carouselPreviews.map((preview, index) => (
                    <div key={preview.url || index} className="relative group aspect-[16/9] rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                      <img src={preview.url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeCarouselImage(index)}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <TrashIcon /> {/* Ensure TrashIcon is correctly defined/imported */}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {carouselPreviews.length === 0 && <p className="text-xs text-slate-500 mt-1">No banner images selected yet.</p>}
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`${btnSecondary} w-full sm:w-auto`}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full sm:w-auto`}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;