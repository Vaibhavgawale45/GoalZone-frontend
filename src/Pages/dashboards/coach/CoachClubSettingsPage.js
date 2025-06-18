// client/src/Pages/dashboards/coach/CoachClubSettingsPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api'; // Path based on your project structure
import { useAuth } from '../../../contexts/AuthContext'; // Path based on your project structure
import { toast } from 'react-toastify';

// Simple Loading Spinner for the button (if different from the page loader)
const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
// Icon for removing carousel images
const XCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
);


const CoachClubSettingsPage = () => {
    const { clubId: clubIdFromUrl } = useParams();
    const { user: coachUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [clubData, setClubData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        groundFeesAmount: '',
        groundFeesCurrency: 'USD',
        groundFeesNotes: '',
        coachingFeesAmount: '',
        coachingFeesCurrency: 'USD',
        coachingFeesNotes: '',
        instagramUrl: '',
        youtubeUrl: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressPostalCode: '',
        addressCountry: '',
        latitude: '',
        longitude: '',
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [carouselFiles, setCarouselFiles] = useState([]); // Stores NEW File objects to be uploaded
    const [carouselPreviews, setCarouselPreviews] = useState([]); // Stores URLs (existing from DB or dataURIs for new files) for display

    const logoInputRef = useRef(null);
    const carouselInputRef = useRef(null);

    const [loading, setLoading] = useState(true); // Page data loading
    const [saving, setSaving] = useState(false); // Form submission loading
    const [pageError, setPageError] = useState('');

    const managedClubIdByAuth = coachUser?.managedClub?._id;

    const populateFormData = useCallback((club) => {
        if (!club) return;
        setFormData({
            name: club.name || '',
            description: club.description || '',
            location: club.location || '',
            groundFeesAmount: club.groundFees?.amount?.toString() || '',
            groundFeesCurrency: club.groundFees?.currency || 'USD',
            groundFeesNotes: club.groundFees?.notes || '',
            coachingFeesAmount: club.coachingFees?.amount?.toString() || '',
            coachingFeesCurrency: club.coachingFees?.currency || 'USD',
            coachingFeesNotes: club.coachingFees?.notes || '',
            instagramUrl: club.socialMedia?.instagramUrl || '',
            youtubeUrl: club.socialMedia?.youtubeUrl || '',
            addressStreet: club.address?.street || '',
            addressCity: club.address?.city || '',
            addressState: club.address?.state || '',
            addressPostalCode: club.address?.postalCode || '',
            addressCountry: club.address?.country || '',
            latitude: club.address?.latitude?.toString() || '',
            longitude: club.address?.longitude?.toString() || '',
        });
        setLogoPreview(club.logoUrl || '');
        setCarouselPreviews(club.carouselImages || []); // Initialize with existing Cloudinary URLs
        setCarouselFiles([]); // Clear any previously selected new files
    }, []);

    const fetchClubSettings = useCallback(async (clubToFetchId) => {
        setLoading(true); setPageError('');
        try {
            const response = await api.get(`/clubs/${clubToFetchId}`);
            setClubData(response.data);
            populateFormData(response.data);
        } catch (err) {
            console.error("Failed to fetch club settings:", err);
            const errMsg = err.response?.data?.message || "Could not load club settings.";
            setPageError(errMsg + " Please try again or contact support.");
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    }, [populateFormData]);

    useEffect(() => {
        if (authLoading) return;
        if (!coachUser || coachUser.role !== 'Coach' || !coachUser.isApproved) { toast.error("Unauthorized access."); navigate('/login', { replace: true }); return; }
        if (!managedClubIdByAuth) { toast.error("You do not currently manage a club."); navigate('/coach/dashboard', { replace: true }); return; }
        if (clubIdFromUrl !== managedClubIdByAuth) { toast.error("You can only edit settings for the club you manage."); navigate(`/coach/club/${managedClubIdByAuth}/settings`, { replace: true }); return; }
        fetchClubSettings(managedClubIdByAuth);
    }, [coachUser, authLoading, clubIdFromUrl, managedClubIdByAuth, navigate, fetchClubSettings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { toast.error("Logo image size should be less than 2MB."); return; }
            setLogoFile(file); // Store the File object
            const reader = new FileReader();
            reader.onloadend = () => { setLogoPreview(reader.result); }; // reader.result is the data URI
            reader.readAsDataURL(file);
        }
    };

    const handleCarouselChange = (e) => {
        const files = Array.from(e.target.files);
        const currentTotalImages = carouselPreviews.length + files.length - carouselFiles.length; // Account for files replacing previews
        
        if (currentTotalImages > 5) {
            toast.error(`You can upload a maximum of 5 carousel images. You currently have ${carouselPreviews.length - carouselFiles.length} and tried to add ${files.length}.`);
            if (carouselInputRef.current) carouselInputRef.current.value = ''; // Clear file input
            return;
        }

        let newFilesToAdd = [];
        let newPreviewsToAddAsDataUri = [];
        let oversizedFileFound = false;

        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                oversizedFileFound = true;
                continue; // Skip this file
            }
            newFilesToAdd.push(file);
        }

        if(oversizedFileFound) toast.error("One or more selected carousel images exceeded the 2MB size limit and were not added.");

        setCarouselFiles(prevFiles => [...prevFiles, ...newFilesToAdd].slice(0, 5 - (carouselPreviews.filter(p => typeof p === 'string' && p.startsWith('http')).length))); // Keep total files (new + ones to keep) within limit

        // Generate previews for newly added valid files
        let previewsProcessed = 0;
        if (newFilesToAdd.length > 0) {
            newFilesToAdd.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviewsToAddAsDataUri.push(reader.result);
                    previewsProcessed++;
                    if (previewsProcessed === newFilesToAdd.length) {
                        setCarouselPreviews(prevRealUrlsAndDataUris => 
                            [...prevRealUrlsAndDataUris, ...newPreviewsToAddAsDataUri].slice(0, 5)
                        );
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        if (carouselInputRef.current) carouselInputRef.current.value = ''; // Clear file input after processing
    };
    
    const removeCarouselImage = (indexToRemove, isPreviewUrl) => {
        const urlOrFileToRemove = carouselPreviews[indexToRemove];
        setCarouselPreviews(prev => prev.filter((_, index) => index !== indexToRemove));

        if (!isPreviewUrl.startsWith('data:')) { // It's an existing URL, not a new file preview
        } else {
 
            setCarouselFiles(prevFiles => {

                const fileIndexToRemove = carouselFiles.findIndex(file => {

                    return false;
                });
                if (fileIndexToRemove > -1) {
                    return prevFiles.filter((_, index) => index !== fileIndexToRemove);
                }
                return prevFiles;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setPageError('');

        const payload = {
            name: formData.name,
            description: formData.description,
            location: formData.location,
            groundFees: { amount: parseFloat(formData.groundFeesAmount) || 0, currency: formData.groundFeesCurrency, notes: formData.groundFeesNotes, },
            coachingFees: { amount: parseFloat(formData.coachingFeesAmount) || 0, currency: formData.coachingFeesCurrency, notes: formData.coachingFeesNotes, },
            socialMedia: { instagramUrl: formData.instagramUrl, youtubeUrl: formData.youtubeUrl, },
            address: { street: formData.addressStreet, city: formData.addressCity, state: formData.addressState, postalCode: formData.addressPostalCode, country: formData.addressCountry, latitude: formData.latitude ? parseFloat(formData.latitude) : null, longitude: formData.longitude ? parseFloat(formData.longitude) : null, }
        };

        if (logoFile) { // If a new logo file was selected
            try {
                payload.logoDataUri = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(logoFile);
                });
            } catch (error) { toast.error("Failed to process logo image."); setSaving(false); return; }
        } else if (logoPreview === '') { // If preview is cleared, signal to backend to remove logo
            payload.logoUrl = ''; // Backend will see this and can set its logoUrl to null/undefined
        }

        payload.existingCarouselImageUrls = carouselPreviews.filter(url => typeof url === 'string' && url.startsWith('http'));
        payload.newCarouselImageURIs = [];

        if (carouselFiles.length > 0) {
            try {
                for (const file of carouselFiles) { // carouselFiles should only contain NEW File objects
                    const dataUri = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    payload.newCarouselImageURIs.push(dataUri);
                }
            } catch (error) { toast.error("Failed to process carousel images."); setSaving(false); return; }
        }


        try {
            console.log("Submitting payload to /clubs/my-club/settings:", payload);
            const response = await api.put(`/clubs/my-club/settings`, payload);
            populateFormData(response.data); // Re-populate form with data from backend
            setClubData(response.data);
            setLogoFile(null); 
            setCarouselFiles([]); // Clear new files state, previews are updated by populateFormData
            toast.success("Club settings updated successfully!");
        } catch (err) { 
            const errorMsg = err.response?.data?.message || "Failed to update club settings.";
            setPageError(errorMsg);
            toast.error(errorMsg);
            console.error("Update club settings error:", err.response || err);
        } finally { setSaving(false); }
    };

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const sectionHeaderClass = "text-lg font-semibold text-slate-700 mb-3 pt-4 border-t border-slate-200 first:pt-0 first:border-t-0";

    if (loading || authLoading) {
        return <div className="flex justify-center items-center p-10"> <p className="ml-3">Loading club settings...</p></div>;
    }
    if (pageError && !clubData) { 
        return <div className="p-6 text-red-600 bg-red-50 rounded-md">{pageError}</div>;
    }
    if (!clubData) { 
        return <div className="p-6 text-slate-600">Club data not available. You may be redirected.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto"> {/* This page is rendered within CoachLayout which has padding */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
                Club Settings: {formData.name || clubData?.name || 'Your Club'}
            </h1>
            {pageError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">{pageError}</p>}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <section>
                    <h2 className={sectionHeaderClass}>Club Identity</h2>
                    <div className="mt-4">
                        <label htmlFor="name" className={labelClass}>Club Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Your Club's Official Name"/>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="logoUpload" className={labelClass}>Club Logo</label>
                        <input 
                            type="file" name="logoUpload" id="logoUpload" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleLogoChange} 
                            ref={logoInputRef}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                        />
                        {logoPreview && (
                            <div className="mt-2 relative w-24 h-24">
                                <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain rounded border p-1 bg-slate-50"/>
                                <button type="button" onClick={() => {setLogoPreview(''); setLogoFile(null); if(logoInputRef.current) logoInputRef.current.value = '';}} className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow-md hover:bg-red-600" title="Remove logo"><XCircleIcon className="w-4 h-4"/></button>
                            </div>
                        )}
                        <p className="mt-1 text-xs text-slate-500">Max 2MB. Recommended: Square.</p>
                    </div>
                </section>
                
                <section>
                    <h2 className={sectionHeaderClass}>Club Showcase (Carousel Images)</h2>
                    <div className="mt-4">
                        <label htmlFor="carouselUpload" className={labelClass}>Add Carousel Images (up to 5)</label>
                        <input 
                            type="file" name="carouselUpload" id="carouselUpload" 
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={handleCarouselChange} 
                            ref={carouselInputRef}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                        />
                         <p className="mt-1 text-xs text-slate-500">Max 2MB per image. Select multiple new images.</p>
                    </div>
                    {carouselPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {carouselPreviews.map((previewSrc, index) => (
                                <div key={previewSrc + index} className="relative group aspect-w-16 aspect-h-9 bg-slate-100 rounded-md overflow-hidden border"> {/* Ensure unique key */}
                                    <img src={previewSrc} alt={`Carousel Preview ${index + 1}`} className="w-full h-full object-cover"/>
                                    <button 
                                        type="button" 
                                        onClick={() => removeCarouselImage(index, previewSrc)} // Pass previewSrc to help identify if it's existing or new
                                        className="absolute top-1 right-1 bg-red-500/80 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Remove image"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className={sectionHeaderClass}>Basic Information</h2>
                    <div><label htmlFor="description" className={labelClass}>Club Description</label><textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} className={inputClass} placeholder="Tell us about your club..."/></div>
                    {/* <div className="mt-4"><label htmlFor="location" className={labelClass}>General Location (e.g., City, Area)</label><input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g., Downtown, North Park"/></div> */}
                </section>

                <section>
                    <h2 className={sectionHeaderClass}>Fees Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div><label htmlFor="groundFeesAmount" className={labelClass}>Ground Fees Amount</label><input type="number" name="groundFeesAmount" id="groundFeesAmount" value={formData.groundFeesAmount} onChange={handleChange} className={inputClass} placeholder="e.g., 50" step="0.01"/></div>
                        {/* <div><label htmlFor="groundFeesCurrency" className={labelClass}>Currency</label><input type="text" name="groundFeesCurrency" id="groundFeesCurrency" value={formData.groundFeesCurrency} onChange={handleChange} className={inputClass} placeholder="e.g., USD, INR"/></div> */}
                        <div className="md:col-span-2"><label htmlFor="groundFeesNotes" className={labelClass}>Ground Fees Notes</label><input type="text" name="groundFeesNotes" id="groundFeesNotes" value={formData.groundFeesNotes} onChange={handleChange} className={inputClass} placeholder="e.g., per month, per session"/></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                        <div><label htmlFor="coachingFeesAmount" className={labelClass}>Coaching Fees Amount</label><input type="number" name="coachingFeesAmount" id="coachingFeesAmount" value={formData.coachingFeesAmount} onChange={handleChange} className={inputClass} placeholder="e.g., 100" step="0.01"/></div>
                        {/* <div><label htmlFor="coachingFeesCurrency" className={labelClass}>Currency</label><input type="text" name="coachingFeesCurrency" id="coachingFeesCurrency" value={formData.coachingFeesCurrency} onChange={handleChange} className={inputClass} placeholder="e.g., USD, INR"/></div> */}
                         <div className="md:col-span-2"><label htmlFor="coachingFeesNotes" className={labelClass}>Coaching Fees Notes</label><input type="text" name="coachingFeesNotes" id="coachingFeesNotes" value={formData.coachingFeesNotes} onChange={handleChange} className={inputClass} placeholder="e.g., monthly, includes kit"/></div>
                    </div>
                </section>

                <section>
                    <h2 className={sectionHeaderClass}>Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="instagramUrl" className={labelClass}>Instagram URL</label><input type="url" name="instagramUrl" id="instagramUrl" value={formData.instagramUrl} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/yourclub"/></div>
                        <div><label htmlFor="youtubeUrl" className={labelClass}>YouTube Channel URL</label><input type="url" name="youtubeUrl" id="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} className={inputClass} placeholder="https://youtube.com/yourclubchannel"/></div>
                    </div>
                </section>

                <section>
                    <h2 className={sectionHeaderClass}>Detailed Address & Location</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div><label htmlFor="addressStreet" className={labelClass}>Street Address</label><input type="text" name="addressStreet" id="addressStreet" value={formData.addressStreet} onChange={handleChange} className={inputClass}/></div>
                        <div><label htmlFor="addressCity" className={labelClass}>City</label><input type="text" name="addressCity" id="addressCity" value={formData.addressCity} onChange={handleChange} className={inputClass}/></div>
                        <div><label htmlFor="addressState" className={labelClass}>State/Province</label><input type="text" name="addressState" id="addressState" value={formData.addressState} onChange={handleChange} className={inputClass}/></div>
                        <div><label htmlFor="addressPostalCode" className={labelClass}>Postal Code</label><input type="text" name="addressPostalCode" id="addressPostalCode" value={formData.addressPostalCode} onChange={handleChange} className={inputClass}/></div>
                        <div className="md:col-span-2"><label htmlFor="addressCountry" className={labelClass}>Country</label><input type="text" name="addressCountry" id="addressCountry" value={formData.addressCountry} onChange={handleChange} className={inputClass}/></div>
                        <div><label htmlFor="latitude" className={labelClass}>Latitude (for map)</label><input type="number" name="latitude" id="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} placeholder="e.g., 34.0522" step="any"/></div>
                        <div><label htmlFor="longitude" className={labelClass}>Longitude (for map)</label><input type="number" name="longitude" id="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} placeholder="e.g., -118.2437" step="any"/></div>
                    </div>
                </section>

                <div className="pt-6 border-t border-slate-200">
                    <button type="submit" disabled={saving} className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:opacity-75">
                        {saving && <ButtonSpinner />}
                        {saving ? 'Saving Settings...' : 'Save Club Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CoachClubSettingsPage;