// client/src/Pages/admin/AdminManageUsersPage.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';

const AdminManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState(''); // '', 'Player', 'Coach', 'Admin'

  // For editing a user (modal would be better, for simplicity, inline edit or separate page)
  // const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole) params.role = filterRole;
      const response = await api.get('/admin/users', { params });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        alert('User deleted successfully.');
      } catch (err) {
        alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
      }
    }
  };
  
  // Placeholder for Edit functionality (you'd typically open a modal or go to an edit page)
  const handleEditUser = (user) => {
    alert(`Editing user: ${user.name}. \nImplement a modal or separate page for editing user details including role, approval (for coach), managed club (for coach) etc.`);
    // Example: setEditingUser(user);
    // Or navigate(`/admin/users/${user._id}/edit`);
  };


  if (loading) return <div className="text-center p-10">Loading users...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>

      <div className="mb-4">
        <label htmlFor="roleFilter" className="mr-2 font-medium">Filter by role:</label>
        <select
          id="roleFilter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Roles</option>
          <option value="Player">Player</option>
          <option value="Coach">Coach</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status (Coach)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Managed Club (Coach)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 'Coach' ? (user.isApproved ? 'Approved' : 'Pending') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'Coach' ? (user.managedClub?.name || 'None') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">No users found matching criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add Modal for editing user here if you choose that approach */}
    </div>
  );
};
export default AdminManageUsersPage;