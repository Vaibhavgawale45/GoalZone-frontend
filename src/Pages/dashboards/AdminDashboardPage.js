// client/src/Pages/dashboards/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../../services/api.js';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingStats(true);
      setLoadingCoaches(true);
      setError('');
      try {
        const [statsRes, coachesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/coaches/pending')
        ]);
        setStats(statsRes.data);
        setPendingCoaches(coachesRes.data);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to fetch admin data';
        setError(errMsg);
      } finally {
        setLoadingStats(false);
        setLoadingCoaches(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleApproveCoach = async (coachId) => {
    try {
      await api.put(`/admin/coaches/${coachId}/approve`);
      setPendingCoaches(prev => prev.filter(coach => coach._id !== coachId));
      alert('Coach approved successfully!');
      // Optionally refetch stats if this affects counts
      // const statsRes = await api.get('/admin/stats'); setStats(statsRes.data);
    } catch (err) {
      alert(`Failed to approve coach: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRejectCoach = async (coachId) => {
    if (window.confirm("Are you sure you want to reject this coach registration?")) {
        try {
            await api.put(`/admin/coaches/${coachId}/reject`);
            setPendingCoaches(prev => prev.filter(coach => coach._id !== coachId));
            alert('Coach rejected successfully!');
        } catch (err) {
            alert(`Failed to reject coach: ${err.response?.data?.message || err.message}`);
        }
    }
  };


  if (loadingStats || loadingCoaches) return <div className="text-center py-10">Loading admin data...</div>;
  // Don't show main error if only one part failed, handle errors per section below.

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Quick Links/Cards for Management Area */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Management Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/manage-users" className="block p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors">
                <h3 className="text-xl font-semibold">Manage Users</h3>
                <p className="mt-2">View, edit, and manage all user accounts (Players, Coaches, Admins).</p>
            </Link>
            <Link to="/admin/manage-clubs" className="block p-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-colors">
                <h3 className="text-xl font-semibold">Manage Clubs</h3>
                <p className="mt-2">View, edit, and manage all football clubs.</p>
            </Link>
             {/* Coach Approvals can be a direct link or part of manage users if you prefer */}
            <div className="p-6 bg-orange-500 text-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">Coach Approvals</h3>
                <p className="mt-2">Focus on pending coach registrations (listed below).</p>
            </div>
        </div>
      </section>


      {/* Stats Section */}
      {error && !stats && <div className="text-center p-4 mb-6 text-red-500 bg-red-100 rounded-md">Error loading statistics: {error}</div>}
      {stats && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Overall Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
                </div>
            ))}
          </div>
        </section>
      )}

      {/* Coach Approval Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Coach Approvals</h2>
        {error && !loadingCoaches && pendingCoaches.length === 0 && <div className="text-center p-4 text-red-500 bg-red-100 rounded-md">Error loading pending coaches: {error}</div>}
        {(!error || pendingCoaches.length > 0) && !loadingCoaches && pendingCoaches.length > 0 ? (
            <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
                 <table className="min-w-full leading-normal">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Coach Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Club to Register</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Registered On</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                    {pendingCoaches.map((coach) => (
                        <tr key={coach._id} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="px-5 py-4 whitespace-no-wrap">{coach.name}</td>
                        <td className="px-5 py-4 whitespace-no-wrap">{coach.email}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{coach.clubNameRegistered}</td>
                        <td className="px-5 py-4 whitespace-no-wrap">{new Date(coach.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 whitespace-no-wrap text-center space-x-2">
                            <button onClick={() => handleApproveCoach(coach._id)} className="text-sm bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded-full">Approve</button>
                            <button onClick={() => handleRejectCoach(coach._id)} className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded-full">Reject</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) :  !loadingCoaches && <p className="text-gray-500 mt-4">No pending coach approvals.</p>}
      </section>
    </div>
  );
};
export default AdminDashboardPage;