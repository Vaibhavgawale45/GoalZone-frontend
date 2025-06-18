// client/src/Pages/admin/AdminSendNotificationPage.js (NEW FILE)
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Your API service
import { toast } from 'react-toastify'; // Or your preferred toast library
import { useAuth } from '../../contexts/AuthContext'; // To get admin user info if needed

// Simple Loading Spinner for the button
const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const AdminSendNotificationPage = () => {
    const { user: adminUser } = useAuth(); // Get admin user if needed for sender info or logging

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [targetAudience, setTargetAudience] = useState('all_players'); // Default target
    // For more specific targeting (future enhancement, not covered by current dropdown)
    // const [specificUserIds, setSpecificUserIds] = useState([]);
    // const [specificClubIds, setSpecificClubIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // For form-level errors

    // Dropdown options for Admin
    const audienceOptions = [
        { value: 'all_players', label: 'All Players' },
        { value: 'all_coaches', label: 'All Coaches' },
        { value: 'all_users', label: 'All Users (Players & Coaches)' },
        // { value: 'specific_clubs', label: 'Players of Specific Club(s)' }, // Requires club selection UI
        // { value: 'specific_users', label: 'Specific User(s)' }, // Requires user selection UI
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast.error("Title and Message are required.");
            return;
        }
        setLoading(true);
        setError('');

        const payload = {
            title: title.trim(),
            message: message.trim(),
            imageUrl: imageUrl.trim() || undefined, // Send undefined if empty
            link: link.trim() || undefined,         // Send undefined if empty
            targetAudience,
            // If implementing specific users/clubs:
            // recipientUserIds: targetAudience === 'specific_users' ? specificUserIds : undefined,
            // recipientClubIds: targetAudience === 'specific_clubs' ? specificClubIds : undefined,
        };

        try {
            console.log("Sending notification with payload:", payload);
            const response = await api.post('/notifications', payload); // API endpoint from notificationRoutes.js
            toast.success(`Notification sent successfully to ${targetAudience.replace('_', ' ')}! (${response.data?.recipientUsers?.length || 0} recipients)`);
            // Reset form
            setTitle('');
            setMessage('');
            setImageUrl('');
            setLink('');
            // setTargetAudience('all_players'); // Optionally reset dropdown
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send notification. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error("Send notification error:", err.response || err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
    const labelClass = "block text-sm font-medium text-slate-700";

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
                    Send New Notification
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="targetAudience" className={labelClass}>Target Audience</label>
                        <select
                            id="targetAudience"
                            name="targetAudience"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className={`${inputClass} appearance-none pr-8 bg-white`}
                            style={{backgroundImage: `url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}
                        >
                            {audienceOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title" className={labelClass}>Notification Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="e.g., Important Update"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className={labelClass}>Message Content</label>
                        <textarea
                            name="message"
                            id="message"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="Enter the full notification message here..."
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className={labelClass}>Image URL (Optional)</label>
                        <input
                            type="url"
                            name="imageUrl"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className={inputClass}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="link" className={labelClass}>Link (Optional)</label>
                        <input
                            type="url"
                            name="link"
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className={inputClass}
                            placeholder="https://example.com/some-page (Opens on click)"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:opacity-75"
                        >
                            {loading && <ButtonSpinner />}
                            {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSendNotificationPage;