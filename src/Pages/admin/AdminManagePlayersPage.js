// client/src/Pages/admin/AdminManagePlayersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import { Link } from 'react-router-dom';

// Placeholder Icons (assuming these are defined elsewhere or are simple spans)
const UserCircleIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="profile">👤</span>;
const EnvelopeIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="email">📧</span>;
const PhoneIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="phone">📞</span>;
const TrashIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="delete">🗑️</span>;
const CheckCircleIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="active">✔️</span>;
const XCircleIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="suspended">❌</span>;
const EyeIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="view">👁️</span>;
const ShieldExclamationIcon = ({className="w-4 h-4"}) => <span className={className} role="img" aria-label="suspend/unsuspend">🛡️</span>; 

const LoadingSpinner = ({small = false}) => (
    <div role="status" className="inline-block">
        <svg aria-hidden="true" className={`${small ? 'w-6 h-6' : 'w-8 h-8'} text-slate-200 animate-spin fill-sky-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <span className="sr-only">Loading...</span>
    </div>
);

// Assuming Pagination component remains the same
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    return (
        <nav aria-label="Page navigation" className="flex justify-center p-4">
            <ul className="inline-flex items-center -space-x-px">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                </li>
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => onPageChange(number)}
                            className={`px-3 py-2 leading-tight border border-slate-300 ${currentPage === number ? 'text-sky-600 bg-sky-50 border-sky-300 hover:bg-sky-100 hover:text-sky-700' : 'text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700'}`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};


const AdminManagePlayersPage = () => {
  const [users, setUsers] = useState([]); // Renaming to 'players' might be clearer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // const [roleFilter, setRoleFilter] = useState(''); // REMOVED
  const [statusFilter, setStatusFilter] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0, // Renaming to 'totalPlayers' might be clearer
    limit: 10,
  });

  const fetchUsers = useCallback(async (page = 1, isInitial = false) => {
    if (!isInitial) {
        setLoading(true);
    } else {
        setLoading(true);
        setInitialLoad(true);
    }
    setError('');
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm.trim(),
        // role: roleFilter, // REMOVED
        status: statusFilter,
      };
      Object.keys(params).forEach(key => (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]);

      // The endpoint /admin/users should now always return players based on backend changes
      const response = await api.get('/admin/users', { params }); 
      
      // Consider renaming response.data.users to response.data.players if backend changes
      if (response && response.data && Array.isArray(response.data.players /* or response.data.users */)) {
        setUsers(response.data.players /* or response.data.users */);
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalUsers: response.data.totalPlayers || response.data.totalUsers || 0,
        }));
      } else if (response && response.data && Array.isArray(response.data.users)) { // Fallback for 'users' key
        setUsers(response.data.users);
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalUsers: response.data.totalUsers || 0,
        }));
      }
      else {
        console.warn("API response did not contain expected 'users' or 'players' array:", response.data);
        setUsers([]);
        setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalUsers: 0 }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch players.');
      setUsers([]);
      setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, totalUsers: 0 }));
    } finally {
      setLoading(false);
      if(isInitial) setInitialLoad(false);
    }
  }, [searchTerm, statusFilter, pagination.limit]); // REMOVED roleFilter from dependencies

  useEffect(() => {
    // Fetch users (which are now always players from this endpoint)
    fetchUsers(1, true); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, pagination.limit]); // REMOVED roleFilter from dependencies

  const handleToggleSuspend = async (userId, currentSuspendedStatus) => {
    try {
        const action = currentSuspendedStatus ? 'unsuspend' : 'suspend';
        await api.patch(`/admin/users/${userId}/${action}`);
        setUsers(prevUsers => prevUsers.map(u => u._id === userId ? {...u, isSuspended: !currentSuspendedStatus} : u));
    } catch (err) {
        setError(err.response?.data?.message || `Failed to ${currentSuspendedStatus ? 'unsuspend' : 'suspend'} user.`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete user ${userName}? This action cannot be undone.`)) {
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
            // Optionally, re-fetch or adjust pagination if totalUsers changes significantly
            setPagination(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.');
        }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      fetchUsers(newPage); // Fetch users for the new page
    }
  };
  
  // Styling (assuming these are defined or Tailwind is set up)
  const inputStyle = "w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm placeholder-slate-400 transition-colors";
  const selectStyle = `${inputStyle} bg-white appearance-none pr-8`;
  const btnSecondaryOutlineSm = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-md hover:bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 disabled:opacity-70";
  const btnSuccessOutlineSm = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 bg-white rounded-md hover:bg-emerald-50 border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 disabled:opacity-70";
  const btnWarningOutlineSm = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-600 bg-white rounded-md hover:bg-amber-50 border border-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 disabled:opacity-70";
  const btnDangerOutlineSm = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-white rounded-md hover:bg-red-50 border border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-70";


  if (loading && initialLoad) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]"><LoadingSpinner /><p className="ml-3 text-slate-600 mt-3 text-lg">Loading Players...</p></div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="pb-5 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Player Management</h1>
        <p className="text-sm text-slate-500 mt-1">View, search, and manage all player accounts.</p>
      </header>

      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"> {/* Adjusted grid */}
          <div>
            <label htmlFor="userSearch" className="block text-xs font-medium text-slate-700 mb-1.5">Search Name/Email</label>
            <input type="text" id="userSearch" placeholder="Type to search players..." value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className={inputStyle}/>
          </div>
          {/* Role Filter REMOVED */}
          <div>
            <label htmlFor="statusFilter" className="block text-xs font-medium text-slate-700 mb-1.5">Filter by Status</label>
            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className={selectStyle}
                    style={{backgroundImage: `url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`}}
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300 shadow-sm text-sm">{error}</div>}

      {loading && !initialLoad && (
        <div className="py-6 text-center">
            <LoadingSpinner small />
            <p className="text-slate-500 text-sm mt-2">Updating player list...</p>
        </div>
      )}

      {!loading && (!users || users.length === 0) && (
        <div className="text-center py-16 bg-white p-10 rounded-xl shadow-lg border border-slate-200">
          <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl text-slate-400" role="img" aria-label="no players icon">👥</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">No Players Found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {searchTerm || statusFilter /* roleFilter removed */
              ? "No players match your current filter criteria." 
              : "There are no players to display at the moment."}
          </p>
        </div>
      )}

      {users && users.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Player</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map(u => ( // u here represents a player
                  <tr key={u._id} className={`hover:bg-slate-50/80 transition-colors duration-150 ${u.isSuspended ? 'opacity-60 bg-red-50 hover:bg-red-100/80' : ''}`}>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm" src={u.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'P')}&background=random&color=fff&size=128`} alt={u.name} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500 sm:hidden">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {/* Since this page is for players, the role will always be 'Player' or similar */}
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300`}>
                        {u.role} 
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{u.phone || <span className="italic text-slate-400">N/A</span>}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">Suspended</span>
                      ) : (
                        <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">Active</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center text-xs font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <Link to={`/player/${u._id}/details`} /* Assumes player details route */
                              className={`${btnSecondaryOutlineSm} gap-1`} title="View Player Details">
                            <EyeIcon /> View
                        </Link>
                        {/* Actions like suspend/delete can remain if admins manage players this way */}
                        <button onClick={() => handleToggleSuspend(u._id, u.isSuspended)} 
                                className={u.isSuspended ? `${btnSuccessOutlineSm} gap-1` : `${btnWarningOutlineSm} gap-1`}
                                title={u.isSuspended ? "Activate Player Account" : "Suspend Player Account"}
                        >
                            {u.isSuspended ? <CheckCircleIcon /> : <ShieldExclamationIcon />}
                            {u.isSuspended ? 'Activate' : 'Suspend'}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)} className={`${btnDangerOutlineSm} gap-1`} title="Delete Player Account">
                            <TrashIcon /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminManagePlayersPage;