// client/src/Pages/admin/AdminManageClubsPage.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
// import { Link } from 'react-router-dom'; // For linking to edit page if desired

const AdminManageClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [editingClub, setEditingClub] = useState(null); // For modal editing

  const fetchClubs = async () => {
    setLoading(true);
    try {
      // Use the admin-specific route if it provides more detail, or general /clubs
      const response = await api.get('/admin/clubs');
      setClubs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch clubs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleDeleteClub = async (clubId) => {
    if (window.confirm('Are you sure you want to delete this club? This will also affect associated coaches and players.')) {
      try {
        await api.delete(`/admin/clubs/${clubId}`); // Uses the clubController's delete (admin-only)
        setClubs(prevClubs => prevClubs.filter(club => club._id !== clubId));
        alert('Club deleted successfully.');
      } catch (err) {
        alert(`Failed to delete club: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Placeholder for Edit functionality
  const handleEditClub = (club) => {
    alert(`Editing club: ${club.name}. \nImplement a modal or separate page for full editing (name, desc, coach, players, etc.).`);
    // Example: setEditingClub(club);
    // Or navigate(`/admin/clubs/${club._id}/edit`);
  };


  if (loading) return <div className="text-center p-10">Loading clubs...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Clubs</h1>
      {/* TODO: Add a "Create New Club" button here if admin should be able to */}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clubs.map((club) => (
              <tr key={club._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{club.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{club.coach?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{club.location || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{club.playerCount || club.players?.length || 0}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{club.status || 'Active'}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleEditClub(club)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDeleteClub(club._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
             {clubs.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No clubs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add Modal for editing club here */}
    </div>
  );
};
export default AdminManageClubsPage;