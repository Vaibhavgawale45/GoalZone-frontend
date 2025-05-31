// client/src/pages/dashboards/PlayerDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import api from '../../services/api.js'; // If you need to fetch player-specific data
import { Link } from 'react-router-dom';

const PlayerDashboardPage = () => {
  const { user } = useAuth(); // Get the logged-in user's data
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
      const fetchEnrollments = async () => {
        if (!user) return; // Should not happen due to ProtectedRoute
        setLoading(true);
        try {
            const response = await api.get('/enrollments/my-status');
            setMyEnrollments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch enrollment status.");
            console.error("Fetch enrollments error:", err);
        } finally {
            setLoading(false);
        }
      };
      fetchEnrollments();
  }, [user]);

  if (!user) {
    // This case should ideally be handled by ProtectedRoute redirecting to login
    return <p>Please log in to view your dashboard.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h1>
        <p className="text-gray-600">This is your Player Dashboard.</p>
        {/* Add links or profile info here */}
        <div className="mt-4">
            <Link to="/clubs" className="text-indigo-600 hover:text-indigo-800 mr-4">Browse Clubs</Link>
            <Link to="/player/profile" className="text-indigo-600 hover:text-indigo-800">My Profile</Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Enrollments</h2>
        {loading && <p>Loading enrollments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && myEnrollments.length === 0 && (
            <p className="text-gray-500">You are not currently enrolled in any clubs.</p>
        )}
        {!loading && !error && myEnrollments.length > 0 && (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myEnrollments.map(enrollment => (
                            <tr key={enrollment._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {enrollment.club?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        enrollment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                        enrollment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {enrollment.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {enrollment.paymentAmount ? `$${enrollment.paymentAmount.toFixed(2)}` : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      {/* Add more player-specific content here */}
    </div>
  );
};

export default PlayerDashboardPage;