// client/src/Pages/coach/CoachSendClubNotificationPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api'; // Ensure this path is correct for your project structure
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext'; // Ensure this path is correct

// Simple Loading Spinner for the button
const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CoachSendClubNotificationPage = () => {
    const { clubId } = useParams(); // <<< CORRECTED: Changed from clubIdFromParams to clubId
    const { user: coachUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [clubName, setClubName] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState('');

    const managedClubId = coachUser?.managedClub?._id;

    useEffect(() => {
        if (authLoading) return; 

        console.log("[CoachSendNotificationPage] clubId (from URL params):", clubId);
        console.log("[CoachSendNotificationPage] coachUser.managedClub._id (derived managedClubId):", managedClubId);

        if (!coachUser || coachUser.role !== 'Coach' || !coachUser.isApproved || !managedClubId) {
            toast.error("You are not authorized to access this page or don't manage a club.");
            navigate('/coach/dashboard'); 
            return;
        }

        // Now 'clubId' (from URL) should be compared with 'managedClubId' (from auth context)
        if (clubId && clubId !== managedClubId) { // Check if clubId from URL is defined and matches
            toast.error("You can only send notifications for the club you manage.");
            const targetPath = managedClubId ? `/coach/club/${managedClubId}/dashboard` : '/coach/dashboard';
            navigate(targetPath, { replace: true });
            return;
        }
        
        // If clubId from URL matches managedClubId (or if managedClubId is the source of truth)
        if (managedClubId) { 
            api.get(`/clubs/${managedClubId}`) // Fetch details for the managed club
                .then(res => setClubName(res.data?.name || 'Your Club'))
                .catch(err => {
                    console.error("Failed to fetch club name", err);
                    setClubName('Your Club');
                    setPageError("Could not load club details."); // Set an error if club fetch fails
                });
        } else {
            // This case should ideally be caught by the earlier check
            setClubName('Your Club (ID missing)');
            setPageError("Managed club information is missing.");
        }

    }, [coachUser, authLoading, managedClubId, clubId, navigate]); // <<< CORRECTED: Added clubId to dependency array


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast.error("Title and Message are required.");
            return;
        }
        if (!managedClubId) { // Crucial check before sending
            toast.error("Cannot send notification: Your managed club ID is missing. Please check your profile or contact support.");
            setPageError("Your managed club information is missing. Cannot send notification.");
            return;
        }

        setLoading(true);
        setPageError('');

        const payload = {
            title: title.trim(),
            message: message.trim(),
            imageUrl: imageUrl.trim() || undefined,
            link: link.trim() || undefined,
            targetAudience: 'club_members', 
            recipientClubIds: [managedClubId], // Use the confirmed managedClubId
        };

        try {
            console.log("Coach sending notification with payload:", payload);
            const response = await api.post('/notifications', payload); 
            toast.success(`Notification sent to members of ${clubName || 'your club'}! (${response.data?.recipientUsers?.length || 0} recipients)`);
            setTitle('');
            setMessage('');
            setImageUrl('');
            setLink('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send notification. Please try again.';
            setPageError(errorMsg);
            toast.error(errorMsg);
            console.error("Send notification error:", err.response || err);
        } finally {
            setLoading(false);
        }
    };
    
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
    const labelClass = "block text-sm font-medium text-slate-700";

    if (authLoading) return <div className="p-8 text-center text-slate-600">Loading user details...</div>;
    
    // If, after loading, essential info is missing or mismatched, show error or redirect (useEffect handles redirect)
    if (!coachUser || coachUser.role !== 'Coach' || !coachUser.isApproved || !managedClubId ) {
        return <div className="p-8 text-center text-red-600">Access denied or club information is missing. You will be redirected.</div>;
    }
    if (clubId && clubId !== managedClubId) { // This check is also in useEffect which redirects
        return <div className="p-8 text-center text-red-600">Club context mismatch. You will be redirected.</div>;
    }


    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">
                    Send Notification to Club
                </h1>
                <p className="text-center text-sm text-slate-500 mb-6">
                    Recipients: Enrolled Players of <span className="font-semibold">{clubName || "your club"}</span>
                </p>

                {pageError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                        {pageError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="title" className={labelClass}>Notification Title</label>
                        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="e.g., Practice Canceled" />
                    </div>
                    <div>
                        <label htmlFor="message" className={labelClass}>Message Content</label>
                        <textarea name="message" id="message" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required className={inputClass} placeholder="Details about the notification..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className={labelClass}>Image URL (Optional)</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://example.com/image.png" />
                    </div>
                    <div>
                        <label htmlFor="link" className={labelClass}>Link (Optional)</label>
                        <input type="url" name="link" id="link" value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} placeholder="https://example.com/details (Opens on click)" />
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={loading || !managedClubId} // Disable if no managed club ID for safety
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:opacity-75"
                        >
                            {loading && <ButtonSpinner />}
                            {loading ? 'Sending...' : `Send to ${clubName || "Club"} Members`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoachSendClubNotificationPage;