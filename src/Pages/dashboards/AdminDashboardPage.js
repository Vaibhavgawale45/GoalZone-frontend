// client/src/Pages/dashboards/AdminDashboardPage.js
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api.js'; // Assuming this is your API service
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const LoadingSpinner = () => ( /* ... Your LoadingSpinner component ... */ <div role="status"><svg aria-hidden="true" className="w-10 h-10 text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><span className="sr-only">Loading...</span></div>);
const StatCard = ({ title, value, icon, colorClass = "text-sky-600" }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                <p className={`text-3xl font-bold ${colorClass} mt-1`}>{value}</p>
            </div>
            {icon && <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>{icon}</div>}
        </div>
    </div>
);


const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null); // This will hold ALL stats for graphs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      setError('');
      try {
        // This endpoint should return a comprehensive stats object
        // e.g., { totalUsers, totalPlayers, totalCoaches, totalClubs, approvedCoaches, pendingCoaches, 
        //         clubsByLocation: [{location: 'CityA', count: 5}, ...], 
        //         playerEnrollmentsMonthly: [{month: 'Jan', count: 10}, ...], etc. }
        const response = await api.get('/admin/dashboard-stats'); 
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch admin statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  // Memoized data for charts
  const userRoleData = useMemo(() => {
    if (!stats?.userCountsByRole) return null;
    return {
      labels: Object.keys(stats.userCountsByRole),
      datasets: [{
        label: 'User Roles',
        data: Object.values(stats.userCountsByRole),
        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'],
        borderColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      }],
    };
  }, [stats?.userCountsByRole]);

  const clubStatusData = useMemo(() => {
    if (!stats?.clubStatusCounts) return null; // e.g., { active: 10, disabled: 2 }
    return {
      labels: Object.keys(stats.clubStatusCounts),
      datasets: [{
        label: 'Club Status',
        data: Object.values(stats.clubStatusCounts),
        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['#4BC0C0', '#FF6384'],
        borderWidth: 1,
      }],
    };
  }, [stats?.clubStatusCounts]);
  
  const monthlyEnrollmentsData = useMemo(() => {
    if (!stats?.monthlyEnrollments) return null; // Expected: [{ month: 'Jan', count: 10 }, { month: 'Feb', count: 15 }...]
    const labels = stats.monthlyEnrollments.map(item => item.month);
    const data = stats.monthlyEnrollments.map(item => item.count);
    return {
      labels,
      datasets: [{
        label: 'New Enrollments per Month',
        data,
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      }],
    };
  }, [stats?.monthlyEnrollments]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' }, title: { display: true, font: {size: 16} } },
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]"><LoadingSpinner /><p className="ml-3 text-slate-600">Loading Dashboard Data...</p></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-300">{error}</div>;
  if (!stats) return <div className="p-6 text-center text-slate-500">No statistics data available.</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      </header>

      {/* Key Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers ?? 'N/A'} colorClass="text-sky-600" />
        <StatCard title="Total Clubs" value={stats.totalClubs ?? 'N/A'} colorClass="text-teal-600" />
        <StatCard title="Active Players" value={stats.activePlayers ?? 'N/A'} colorClass="text-emerald-600" />
        <StatCard title="Pending Coaches" value={stats.pendingCoachesCount ?? 'N/A'} colorClass="text-amber-600" />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {userRoleData && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">User Role Distribution</h2>
            <div className="h-80 md:h-96"> {/* Fixed height for chart container */}
              <Doughnut data={userRoleData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'User Roles'}}}} />
            </div>
          </div>
        )}
        {clubStatusData && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">Club Status</h2>
            <div className="h-80 md:h-96">
              <Bar data={clubStatusData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Active vs. Disabled Clubs'}}}} />
            </div>
          </div>
        )}
      </section>
      
      {monthlyEnrollmentsData && (
         <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
             <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">Monthly New Enrollments</h2>
             <div className="h-80 md:h-96">
                 <Line data={monthlyEnrollmentsData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Enrollment Trends'}}}}/>
             </div>
         </section>
      )}

    </div>
  );
};

export default AdminDashboardPage;