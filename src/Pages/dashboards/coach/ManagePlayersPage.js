import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext.js';
import api from '../../../services/api.js';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditPlayerByCoachModal from '../../../components/coach/EditPlayerByCoachModal.js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const SortAscIcon = () => <span role="img" aria-label="sort ascending">🔼</span>;
const SortDescIcon = () => <span role="img" aria-label="sort descending">🔽</span>;
const UsersPlaceholderIcon = () => <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl text-slate-400">👥</div>;
const WarningIcon = () => <div className="w-16 h-16 text-orange-500 mb-4 text-4xl">⚠️</div>;
const ErrorIcon = () => <div className="w-16 h-16 text-red-500 mb-4 text-4xl">🛑</div>;
const LoadingSpinner = () => <div role="status"><svg aria-hidden="true" className="w-10 h-10 text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg></div>;


const ConfirmOfflinePaymentModal = ({ isOpen, onClose, request, onConfirm }) => {
    const [amountPaid, setAmountPaid] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (request?.club?.enrollmentDurationDays && startDate) {
            const newEndDate = new Date(startDate);
            newEndDate.setDate(newEndDate.getDate() + request.club.enrollmentDurationDays);
            setEndDate(newEndDate.toISOString().split('T')[0]);
        }
    }, [startDate, request]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!request?.player?._id || !request?.club?._id) {
            console.error("Missing player or club ID in the request object.");
            return;
        }

        setProcessing(true);
        try {
            await onConfirm({
                playerId: request.player._id,
                clubId: request.club._id,
                amountPaid: Number(amountPaid),
                startDate,
                endDate,
                notes,
            });
        } finally {
            setProcessing(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirm Offline Payment</h3>
                <p className="text-sm text-slate-600 mb-4">For player: <span className="font-bold">{request?.player?.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amountPaid" className="block text-sm font-medium text-slate-700">Amount Paid (INR)</label>
                        <input type="number" id="amountPaid" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows="2" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} disabled={processing} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md border hover:bg-slate-200">Cancel</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-400">
                            {processing ? 'Processing...' : 'Confirm & Activate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManagePlayersPage = () => {
    const { user: coachUser } = useAuth();
    const clubId = coachUser?.managedClub?._id;
    const clubName = coachUser?.managedClub?.name;

    const [enrollments, setEnrollments] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
    const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
    const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
    const [selectedRequestToConfirm, setSelectedRequestToConfirm] = useState(null);

    const [statusFilter, setStatusFilter] = useState('all');
    const [scoreSortOrder, setScoreSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPageData = useCallback(async () => {
        if (!clubId) {
            setError("No club assigned to manage."); setLoading(false); return;
        }
        setLoading(true); setError('');
        try {
            const [enrollmentsRes, pendingRes] = await Promise.all([
                api.get(`/coaches/my-club/club-enrollments`),
                api.get(`/enrollments/pending-offline/${clubId}`)
            ]);
            setEnrollments(enrollmentsRes.data || []);
            setPendingRequests(pendingRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch player data.");
        } finally { setLoading(false); }
    }, [clubId]);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);
  
    const handleDataUpdated = () => {
        fetchPageData(); 
        setIsEditPlayerModalOpen(false);
        setSelectedPlayerForEdit(null);
        setIsConfirmPaymentModalOpen(false);
        setSelectedRequestToConfirm(null);
    };

    const handleConfirmOfflinePayment = async (formData) => {
        try {
            const res = await api.post('/enrollments/confirm-offline', formData);
            toast.success(res.data.message);
            handleDataUpdated();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm payment.');
        }
    };
    
    const openConfirmPaymentModal = (request) => {
        setSelectedRequestToConfirm(request);
        setIsConfirmPaymentModalOpen(true);
    };

    const openEditPlayerModal = (player) => {
        setSelectedPlayerForEdit(player);
        setIsEditPlayerModalOpen(true);
    };
    
    const btnPrimary = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500";
    const btnFilterSort = "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-300 shadow-sm";

    const displayedEnrollments = useMemo(() => {
        let filtered = [...enrollments];
        if (searchTerm.trim()) { filtered = filtered.filter(e => e.player.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));}
        if (statusFilter !== 'all') {
            filtered = filtered.filter(e => e.status === statusFilter);
        }
        if (scoreSortOrder === 'asc') { filtered.sort((a, b) => (a.player.score ?? -1) - (b.player.score ?? -1)); } 
        else { filtered.sort((a, b) => (b.player.score ?? -1) - (a.player.score ?? -1)); }
        return filtered;
    }, [enrollments, statusFilter, scoreSortOrder, searchTerm]);

    const toggleScoreSortOrder = () => setScoreSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    const formatDate = (dateString) => {
      if(!dateString) return <span className="italic text-slate-400">N/A</span>;
      return new Date(dateString).toLocaleDateString('en-GB');
    };
    const getStatusInfo = (enrollment) => {
        if (enrollment.status === 'expired') { return { text: 'Expired', class: 'bg-red-100 text-red-800 border-red-200' }; }
        if (enrollment.status === 'active') { return { text: 'Active', class: 'bg-green-100 text-green-800 border-green-200' }; }
        return { text: enrollment.status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    const chartData = useMemo(() => {
        const activeCount = enrollments.filter(e => e.status === 'active').length;
        const expiredCount = enrollments.filter(e => e.status === 'expired').length;
        return {
            labels: ['Active Members', 'Expired Memberships'],
            datasets: [{
                data: [activeCount, expiredCount],
                backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            }]
        };
    }, [enrollments]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }}};

    if (loading) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6"><LoadingSpinner /><p className="mt-4">Loading Players...</p></div>; }
    if (error && !clubId) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center"><WarningIcon /><p className="mt-2">{error}</p></div>; }
    if (error) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center"><ErrorIcon /><p className="mt-2">{error}</p><button onClick={fetchPageData} className={btnPrimary}>Try Again</button></div>; }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Manage Players</h1>
                {clubName && <p className="text-md text-slate-500 mt-1">For club: <span className="font-semibold">{clubName}</span></p>}
            </header>

            {pendingRequests.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Offline Requests</h2>
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-amber-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-amber-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Player</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Request Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {pendingRequests.map(request => (
                                        <tr key={request._id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><img className="h-10 w-10 rounded-full object-cover" src={request.player.imageUrl} alt="" /><span className="font-medium text-slate-800">{request.player.name}</span></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{request.player.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(request.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openConfirmPaymentModal(request)} className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Confirm Payment</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {enrollments.length > 0 && (
                <section className="h-72 bg-white p-6 rounded-xl shadow-lg border">
                    <Doughnut data={chartData} options={chartOptions} />
                </section>
            )}

            {enrollments.length > 0 && (
                <div className="p-5 bg-white rounded-xl shadow-md border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="playerSearch" className="block text-sm font-medium text-slate-700 mb-1">Search Player</label>
                            <input type="text" id="playerSearch" placeholder="Enter name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full form-input"/>
                        </div>
                        <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-1">Filter Status</label>
                            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full form-select">
                                <option value="all">All</option><option value="active">Active</option><option value="expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <button onClick={toggleScoreSortOrder} className={`${btnFilterSort} w-full justify-between`}>
                                <span>Score: {scoreSortOrder === 'desc' ? 'High to Low' : 'Low to High'}</span>
                                {scoreSortOrder === 'desc' ? <SortDescIcon/> : <SortAscIcon/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {displayedEnrollments.length === 0 && !loading ? (
                <div className="text-center py-16 bg-white p-10 rounded-xl shadow-lg border">
                    <UsersPlaceholderIcon />
                    <h3 className="text-2xl font-semibold mt-4">{searchTerm || statusFilter !== 'all' ? 'No Players Match Criteria' : 'No Players Enrolled'}</h3>
                    <p className="text-slate-500 mt-2">{searchTerm || statusFilter !== 'all' ? 'Try adjusting your search.' : "This club has no active enrollments."}</p>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Player</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase cursor-pointer" onClick={toggleScoreSortOrder}>Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Membership</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {displayedEnrollments.map((enrollment) => {
                                    if(!enrollment.player) return null;
                                    const statusInfo = getStatusInfo(enrollment);
                                    return (
                                        <tr key={enrollment._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><img className="h-12 w-12 rounded-full object-cover" src={enrollment.player.imageUrl} alt="" /><div className="text-sm"><Link to={`/player/${enrollment.player._id}`} className="font-semibold text-sky-600 hover:underline">{enrollment.player.name}</Link><div className="text-slate-500">{enrollment.player.email}</div></div></div></td>
                                            <td className="px-6 py-4 text-xl font-bold text-sky-600 text-center">{enrollment.player.score ?? <span className="text-sm text-slate-400 italic">N/A</span>}</td>
                                            <td className="px-6 py-4 text-xs"><span className={`px-2 py-0.5 font-semibold rounded-full border ${statusInfo.class}`}>{statusInfo.text}</span><div className="text-slate-500 mt-1.5">Ends: <span className="font-medium text-slate-700">{formatDate(enrollment.endDate)}</span></div></td>
                                            <td className="px-6 py-4"><div className="flex items-center space-x-3"><button onClick={() => openEditPlayerModal(enrollment.player)} className="px-3 py-1.5 text-xs font-medium rounded-md border bg-white hover:bg-slate-50">Edit</button></div></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isEditPlayerModalOpen && selectedPlayerForEdit && (
                <EditPlayerByCoachModal isOpen={isEditPlayerModalOpen} onClose={() => setIsEditPlayerModalOpen(false)} player={selectedPlayerForEdit} onPlayerUpdated={handleDataUpdated} />
            )}
            
            {isConfirmPaymentModalOpen && selectedRequestToConfirm && (
                <ConfirmOfflinePaymentModal
                    isOpen={isConfirmPaymentModalOpen}
                    onClose={() => setIsConfirmPaymentModalOpen(false)}
                    request={selectedRequestToConfirm}
                    onConfirm={handleConfirmOfflinePayment}
                />
            )}
        </div>
    );
};

export default ManagePlayersPage;