import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import { FiDollarSign, FiUsers, FiBarChart2, FiAlertTriangle, FiCalendar } from 'react-icons/fi';

// --- Reusable Helper Components ---

const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div role="status" className="text-center p-4">
            <svg aria-hidden="true" className="w-10 h-10 mx-auto text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <p className="mt-4 text-lg font-medium text-slate-600">Loading Payments Data...</p>
        </div>
    </div>
);

const ErrorComponent = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-md min-h-[50vh]">
        <FiAlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-700 mb-2">Error Loading Data</p>
        <p className="text-slate-600 mb-6 max-w-md">{message}</p>
        <button onClick={onRetry} className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700">
            Try Again
        </button>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl min-h-[50vh]">
        <FiDollarSign className="w-20 h-20 text-slate-400 mb-4" />
        <p className="text-xl font-semibold text-slate-700 mb-2">No Payments Yet</p>
        <p className="text-slate-500 max-w-md">Once players enroll in your clubs, their payment information will appear here.</p>
    </div>
);

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

// --- Main Dashboard Component ---

const CoachPaymentsDashboard = () => {
    // const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const fetchData = async (signal) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('coaches/my-club/payments', { signal });
            setPayments(data || []);
        } catch (err) {
            if (!signal.aborted) {
                setError(err.response?.data?.message || "Failed to fetch payments.");
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        fetchData(abortController.signal);
        return () => abortController.abort();
    }, []);

    // --- Data Processing with useMemo for Performance ---

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    };

    const kpiStats = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalEarnings = payments.reduce((acc, p) => acc + (p.transferDetails?.coachTransfer || 0), 0);
        const earningsThisMonth = payments
            .filter(p => new Date(p.createdAt) >= firstDayOfMonth)
            .reduce((acc, p) => acc + (p.transferDetails?.coachTransfer || 0), 0);
        
        const newEnrollmentsThisMonth = payments.filter(p => new Date(p.createdAt) >= firstDayOfMonth).length;

        return {
            totalEarnings: formatCurrency(totalEarnings),
            earningsThisMonth: formatCurrency(earningsThisMonth),
            newEnrollmentsThisMonth,
        };
    }, [payments]);

    const monthlyData = useMemo(() => {
        return payments.reduce((acc, p) => {
            const monthYear = new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            if (!acc[monthYear]) {
                acc[monthYear] = { earnings: 0, payments: [] };
            }
            acc[monthYear].earnings += p.transferDetails?.coachTransfer || 0;
            acc[monthYear].payments.push(p);
            return acc;
        }, {});
    }, [payments]);

    const availableMonths = Object.keys(monthlyData);
    const displayedPayments = selectedMonth ? (monthlyData[selectedMonth]?.payments || []) : payments;

    useEffect(() => {
        if (availableMonths.length > 0 && !selectedMonth) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths, selectedMonth]);


    if (loading) return <LoadingComponent />;
    if (error) return <ErrorComponent message={error} onRetry={() => fetchData(new AbortController().signal)} />;
    
    return (
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments Dashboard</h1>
                {/* <p className="mt-1 text-slate-600">Welcome, {user.name}. Here's your financial overview.</p> */}
            </header>

            {payments.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* KPI Stats Section */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard title="Total Earnings (All-Time)" value={kpiStats.totalEarnings} icon={FiDollarSign} colorClass="bg-green-500" />
                        <StatsCard title="Earnings This Month" value={kpiStats.earningsThisMonth} icon={FiCalendar} colorClass="bg-sky-500" />
                        <StatsCard title="New Enrollments This Month" value={kpiStats.newEnrollmentsThisMonth} icon={FiUsers} colorClass="bg-amber-500" />
                    </section>
                    
                    {/* Monthly Breakdown Section */}
                    <section className="bg-white shadow-lg rounded-xl border border-slate-200">
                        <header className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2.5"><FiBarChart2 /> Monthly Breakdown</h2>
                                <p className="text-sm text-slate-500 mt-1">Select a month to view a summary of enrollments.</p>
                            </div>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full sm:w-auto mt-2 sm:mt-0 form-select rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                            >
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </header>
                        {selectedMonth && monthlyData[selectedMonth] && (
                            <div className="p-4 sm:p-6 bg-slate-50">
                                <h3 className="text-lg font-bold">Summary for {selectedMonth}</h3>
                                <div className="flex items-center gap-6 mt-2 text-slate-600">
                                    <p>Total Earnings: <span className="font-semibold text-green-600">{formatCurrency(monthlyData[selectedMonth].earnings)}</span></p>
                                    <p>Total Enrollments: <span className="font-semibold text-sky-600">{monthlyData[selectedMonth].payments.length}</span></p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Detailed Payments Table */}
                    <section className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
                        <header className="p-4 sm:p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {selectedMonth ? `Payments in ${selectedMonth}` : 'All Recent Payments'}
                            </h2>
                        </header>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Player</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Club</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid by Player</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {displayedPayments.map(p => (
                                        <tr key={p._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={p.player?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.player?.name || 'P')}`} alt="" />
                                                    <span className="text-sm font-semibold text-slate-800">{p.player?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.club?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-medium">{formatCurrency(p.amountDetails.totalAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-bold">{formatCurrency(p.transferDetails.coachTransfer)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default CoachPaymentsDashboard;