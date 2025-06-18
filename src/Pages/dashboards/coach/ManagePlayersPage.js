import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext.js';
import api from '../../../services/api.js';
import { Link } from 'react-router-dom';

import UpdatePaymentModal from '../../../components/coach/UpdatePaymentModal.js';
import EditPlayerByCoachModal from '../../../components/coach/EditPlayerByCoachModal.js';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const FilterIcon = () => <span role="img" aria-label="filter">📊</span>; 
const SortAscIcon = () => <span role="img" aria-label="sort ascending">🔼</span>;
const SortDescIcon = () => <span role="img" aria-label="sort descending">🔽</span>;
const UsersPlaceholderIcon = () => <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl text-slate-400" role="img" aria-label="no players icon">👥</div>;
const WarningIcon = () => <div className="w-16 h-16 text-orange-500 mb-4 text-4xl" role="img" aria-label="warning">⚠️</div>;
const ErrorIcon = () => <div className="w-16 h-16 text-red-500 mb-4 text-4xl" role="img" aria-label="error">🛑</div>;
const LoadingSpinner = () => <div role="status"><svg aria-hidden="true" className="w-10 h-10 text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><span className="sr-only">Loading...</span></div>;

const ManagePlayersPage = () => {
  const { user: coachUser } = useAuth();
  const clubId = coachUser?.managedClub?._id;
  const clubName = coachUser?.managedClub?.name;

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false);
  const [selectedPlayerForPayment, setSelectedPlayerForPayment] = useState(null);
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreSortOrder, setScoreSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClubEnrollments = useCallback(async () => {
    if (!clubId) {
      setError("No club assigned to manage."); setLoading(false); return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await api.get(`/coaches/my-club/club-enrollments`);
      setEnrollments(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch player enrollments.");
    } finally { setLoading(false); }
  }, [clubId]);

  useEffect(() => { fetchClubEnrollments(); }, [fetchClubEnrollments]);

  const handlePlayerRemoved = async (playerIdToRemove) => {
    if (!window.confirm("Are you sure? This will remove the player's active enrollment in your club.")) return;
    try {
      await api.delete(`/coach/club/${clubId}/enrollments/${playerIdToRemove}`);
      setEnrollments(prev => prev.filter(e => e.player._id !== playerIdToRemove));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove player.");
    }
  };
  
  const handleDataUpdated = () => {
    fetchClubEnrollments(); 
    setIsUpdatePaymentModalOpen(false);
    setSelectedPlayerForPayment(null); 
    setIsEditPlayerModalOpen(false);
    setSelectedPlayerForEdit(null);
  };

  const openUpdatePaymentModal = (player) => {
    setSelectedPlayerForPayment(player);
    setIsUpdatePaymentModalOpen(true);
  };

  const openEditPlayerModal = (player) => {
    setSelectedPlayerForEdit(player);
    setIsEditPlayerModalOpen(true);
  };
  
  const btnPrimary = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const btnDangerOutlineSm = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white rounded-md hover:bg-red-50 border border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors shadow-sm";
  const btnSecondaryOutlineSm = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white rounded-md hover:bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors shadow-sm";
  const btnFilterSort = "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors shadow-sm";

  const displayedEnrollments = useMemo(() => {
    let filtered = [...enrollments];
    if (searchTerm.trim()) { filtered = filtered.filter(e => e.player.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));}
    if (statusFilter !== 'all') {
        if(statusFilter === 'expired') {
            filtered = filtered.filter(e => new Date(e.endDate) < new Date());
        } else {
            filtered = filtered.filter(e => e.status === statusFilter && new Date(e.endDate) >= new Date());
        }
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
    const now = new Date();
    const endDate = new Date(enrollment.endDate);
    if (endDate < now) {
      return { text: 'Expired', class: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (enrollment.status === 'active') {
      return { text: 'Active', class: 'bg-green-100 text-green-800 border-green-200' };
    }
    return { text: enrollment.status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const chartData = useMemo(() => {
    const activeCount = enrollments.filter(e => new Date(e.endDate) >= new Date()).length;
    const expiredCount = enrollments.length - activeCount;
    return {
        labels: ['Active Members', 'Expired Memberships'],
        datasets: [{
            data: [activeCount, expiredCount],
            backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }]
    };
  }, [enrollments]);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Club Membership Status' } } };

  if (loading) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6"><LoadingSpinner /><p className="text-lg font-semibold text-slate-700 mt-4">Loading Players...</p></div>; }
  if (error && !clubId) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center"><WarningIcon /><p className="text-xl font-semibold text-orange-700 mb-2 mt-2">Club Not Assigned</p><p className="text-slate-600 mb-6 max-w-md">{error}</p><p className="text-sm text-slate-500">Please contact an administrator.</p></div>; }
  if (error) { return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center"><ErrorIcon /><p className="text-xl font-semibold text-red-700 mb-2 mt-2">Error Loading Players</p><p className="text-slate-600 mb-6 max-w-md">{error}</p><button onClick={fetchClubEnrollments} className={btnPrimary}>Try Again</button></div>; }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Manage Enrolled Players</h1>
        {clubName && <p className="text-md text-slate-500 mt-1">For club: <span className="font-semibold text-slate-700">{clubName}</span></p>}
      </header>

      {enrollments.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">Membership Overview</h3>
                <div className="h-64 md:h-72">
                     <Doughnut data={chartData} options={chartOptions} />
                </div>
            </div>
        </section>
      )}

      {enrollments.length > 0 && (
          <div className="mb-6 p-4 sm:p-5 bg-white rounded-xl shadow-md border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                      <label htmlFor="playerSearch" className="block text-sm font-medium text-slate-700 mb-1">Search by Name</label>
                      <input type="text" id="playerSearch" placeholder="Enter player name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"/>
                  </div>
                  <div>
                      <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-1">Filter by Status</label>
                      <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm appearance-none bg-white pr-8">
                          <option value="all">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option>
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
        <div className="text-center py-16 bg-white p-10 rounded-xl shadow-lg border border-slate-200">
            <UsersPlaceholderIcon />
            <h3 className="text-2xl font-semibold text-slate-700 mt-4 mb-2">{searchTerm || statusFilter !== 'all' ? 'No Players Match Criteria' : 'No Players Enrolled'}</h3>
            <p className="text-slate-500 max-w-md mx-auto">{searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter terms.' : "This club currently has no active player enrollments."}</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Player</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors" onClick={toggleScoreSortOrder}>
                    <div className="flex items-center justify-center gap-1">Score {scoreSortOrder === 'desc' ? <SortDescIcon/> : <SortAscIcon/>}</div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Membership Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {displayedEnrollments.map((enrollment) => {
                  const player = enrollment.player;
                  if(!player) return null;
                  const statusInfo = getStatusInfo(enrollment);
                  return (
                    <tr key={enrollment._id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-full object-cover border border-slate-200" src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name || 'P')}&background=random&color=fff&size=128`} alt={player.name} /></div>
                          <div className="ml-4">
                            <Link to={`/player/${player._id}/details`} className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline">{player.name}</Link>
                            <div className="text-xs text-slate-500 md:hidden">{player.position || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="truncate" title={player.email}>{player.email || <span className="italic">No email</span>}</div>
                        <div className="truncate text-slate-500" title={player.phone}>{player.phone || <span className="italic">No phone</span>}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-600">{player.position || <span className="italic">N/A</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xl text-sky-600 font-bold text-center">{(player.score ?? 'N/A') === 'N/A' ? <span className="text-sm text-slate-400 italic">N/A</span> : player.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className={`px-2 py-0.5 inline-flex leading-tight font-semibold rounded-full border ${statusInfo.class}`}>{statusInfo.text}</span>
                          <div className="text-slate-500 mt-1.5">Ends: <span className="font-medium text-slate-700">{formatDate(enrollment.endDate)}</span></div>
                          <div className="text-slate-400 text-xxs mt-0.5">Payment ID: {enrollment.payment?._id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openEditPlayerModal(player)} className={`${btnSecondaryOutlineSm} gap-1.5`}>Edit</button>
                          <button onClick={() => handlePlayerRemoved(player._id)} className={`${btnDangerOutlineSm} gap-1.5`}><span className="hidden sm:inline">Remove</span><span className="sm:hidden">X</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isUpdatePaymentModalOpen && selectedPlayerForPayment && (
        <UpdatePaymentModal isOpen={isUpdatePaymentModalOpen} onClose={() => setIsUpdatePaymentModalOpen(false)} player={selectedPlayerForPayment} onPaymentUpdated={handleDataUpdated}/>
      )}
      {isEditPlayerModalOpen && selectedPlayerForEdit && (
        <EditPlayerByCoachModal isOpen={isEditPlayerModalOpen} onClose={() => setIsEditPlayerModalOpen(false)} player={selectedPlayerForEdit} onPlayerUpdated={handleDataUpdated} />
      )}
    </div>
  );
};

export default ManagePlayersPage;