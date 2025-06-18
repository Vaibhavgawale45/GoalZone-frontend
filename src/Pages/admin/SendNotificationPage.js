// src/Pages/admin/SendNotificationPage.js (or similar for Coach)
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SendNotificationPage = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // For image URL
    const [link, setLink] = useState('');
    const [targetAudience, setTargetAudience] = useState('all_players'); // Default
    const [users, setUsers] = useState([]); // For 'specific_users'
    const [clubs, setClubs] = useState([]); // For 'specific_clubs' or coach's 'club_members'
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedClubIds, setSelectedClubIds] = useState([]);
    const [loading, setLoading] = useState(false);

    // TODO: Fetch users and clubs if targetAudience is specific_users or specific_clubs
    // This is a simplified example; a real implementation would have better UI for selection.
    useEffect(() => {
        // Example: Fetch all users if admin, or coach's club members
        // api.get('/users/selectable').then(res => setUsers(res.data));
        // api.get('/clubs/selectable').then(res => setClubs(res.data));
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { title, message, imageUrl, link, targetAudience };
            if (targetAudience === 'specific_users') payload.recipientUserIds = selectedUserIds;
            if (targetAudience === 'specific_clubs' || targetAudience === 'club_members') payload.recipientClubIds = selectedClubIds;

            await api.post('/notifications', payload);
            toast.success('Notification sent successfully!');
            setTitle(''); setMessage(''); setImageUrl(''); setLink('');
            setSelectedUserIds([]); setSelectedClubIds([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notification.');
        } finally {
            setLoading(false);
        }
    };

    // Very basic UI for example
    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h1 className="text-xl font-bold text-slate-700">Send Notification</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows="3" required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"></textarea>
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700">Image URL (Optional)</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="link" className="block text-sm font-medium text-slate-700">Link (Optional)</label>
                    <input type="url" id="link" value={link} onChange={e => setLink(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700">Target Audience</label>
                    <select id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                        {/* Admin options */}
                        {/* <option value="all_users">All Users</option> */}
                        <option value="all_players">All Players</option>
                        <option value="all_coaches">All Coaches</option>
                        {/* <option value="specific_users">Specific Users</option> */}
                        {/* <option value="specific_clubs">Specific Clubs</option> */}
                        {/* Coach options */}
                        {/* <option value="club_members">My Club Member(s)</option> */}
                    </select>
                </div>
                {/* TODO: Add UI for selecting specific users/clubs if those options are chosen */}
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400">
                    {loading ? 'Sending...' : 'Send Notification'}
                </button>
            </form>
        </div>
    );
};
export default SendNotificationPage;