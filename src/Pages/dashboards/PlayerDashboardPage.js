import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import api from '../../services/api.js';
import { Link } from 'react-router-dom';
import UserProfileEditModal from '../../components/user/UserProfileEditModal.js';

// --- Professional Icon Imports ---
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiAward, FiInfo, FiStar, FiEdit, FiList, FiClock, FiTag, FiAlertTriangle
} from 'react-icons/fi';

// --- Reusable Components ---

const LoadingComponent = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-6">
        <div role="status">
            <svg aria-hidden="true" className="w-10 h-10 text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        </div>
        <p className="mt-4 text-lg font-medium text-slate-600">{message}</p>
    </div>
);

const ErrorComponent = ({ message, onRetry }) => (
    <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 min-h-[30vh]">
            <FiAlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</p>
            <p className="text-slate-600 mb-6 max-w-md">{message}</p>
            <button onClick={onRetry} className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                Try Again
            </button>
        </div>
    </div>
);

const ProfileDetailItem = ({ icon: Icon, label, value, valueClass = "text-slate-700", children }) => {
    if (!(value || value === 0 || typeof value === 'boolean' || children)) return null;
    return (
        <div className="flex items-start gap-3 py-3">
            {Icon && <Icon className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                {children ? (
                    <div className={`text-sm md:text-base ${valueClass} break-words`}>{children}</div>
                ) : (
                    <p className={`text-sm md:text-base ${valueClass} break-words`}>{String(value)}</p>
                )}
            </div>
        </div>
    );
};

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return <span className="italic text-slate-400">N/A</span>;
    const date = new Date(dateString);
    if (isNaN(date)) return <span className="italic text-slate-400">Invalid Date</span>;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getPaymentStatusClass = (status) => {
    const base = "px-2 py-0.5 inline-flex text-xs leading-tight font-semibold rounded-full border";
    switch (status?.toLowerCase()) {
      case 'succeeded': return `${base} bg-green-100 text-green-800 border-green-200`;
      case 'failed': return `${base} bg-red-100 text-red-800 border-red-200`;
      case 'refunded': return `${base} bg-blue-100 text-blue-800 border-blue-200`;
      default: return `${base} bg-slate-100 text-slate-700 border-slate-200`;
    }
};

const PlayerDashboardPage = () => {
    const { user, setUser: setAuthUser, loading: authLoading } = useAuth();
    const [playerProfile, setPlayerProfile] = useState(null);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    useEffect(() => {
        if (authLoading || !user?._id) {
            setLoadingData(authLoading);
            return;
        }

        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchData = async () => {
            setLoadingData(true);
            setError('');
            try {
                const [profileResponse, enrollmentsResponse] = await Promise.all([
                    api.get('/users/profile', { signal }),
                    api.get('/enrollments/my-enrollments', { signal })
                ]);
                
                if (!signal.aborted) {
                    setPlayerProfile(profileResponse.data);
                    setMyEnrollments(enrollmentsResponse.data || []);
                }
            } catch (err) {
                if (!signal.aborted) {
                    setError(err.response?.data?.message || "Failed to load dashboard data.");
                }
            } finally {
                if (!signal.aborted) {
                    setLoadingData(false);
                }
            }
        };

        fetchData();

        return () => {
            abortController.abort();
        };
    }, [user?._id, authLoading]);

    const handleProfileUpdated = (updatedUserData) => {
        setPlayerProfile(prev => ({ ...prev, ...updatedUserData }));
        setAuthUser(prev => ({ ...prev, ...updatedUserData }));
        setIsEditProfileModalOpen(false);
    };

    const isLoading = authLoading || loadingData;
    const dataToDisplay = playerProfile || user;

    if (isLoading) return <LoadingComponent message="Loading Your Dashboard..." />;
    if (error) return <ErrorComponent message={error} onRetry={() => window.location.reload()} />;
    if (!dataToDisplay) return <div className="p-6 text-center text-lg text-slate-600">Could not load user data. Please try logging in again.</div>;

    // Derive payment history from the enrollments data for consistency
    const paymentHistory = myEnrollments
        .filter(enrollment => enrollment.payment) // Only include enrollments that have a payment record
        .map(enrollment => ({
            ...enrollment.payment, // Spread all fields from the populated payment object
            clubName: enrollment.club?.name || 'N/A' // Add club name for context
        }));

    return (
        <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10">
            {/* --- Profile Summary Card --- */}
            <section className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <img
                            src={dataToDisplay.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(dataToDisplay.name || 'P')}&size=160&background=475569&color=FFF&font-size=0.5&bold=true`}
                            alt={`${dataToDisplay.name}'s profile`}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-500 shadow-2xl flex-shrink-0"
                        />
                        <div className="text-center sm:text-left flex-grow">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{dataToDisplay.name}</h1>
                            <p className="text-slate-300 text-lg mt-1 capitalize">{dataToDisplay.role} Dashboard</p>
                            <button onClick={() => setIsEditProfileModalOpen(true)} className="mt-5 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg shadow-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-all">
                                <FiEdit /> Edit My Profile
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 divide-y divide-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 pb-3">
                        <ProfileDetailItem icon={FiMail} label="Email" value={dataToDisplay.email} />
                        <ProfileDetailItem icon={FiPhone} label="Phone" value={dataToDisplay.phone || "Not Provided"} />
                        <ProfileDetailItem icon={FiCalendar} label="Date of Birth" value={dataToDisplay.dob ? formatDate(dataToDisplay.dob) : "Not Provided"} />
                        <ProfileDetailItem icon={FiUser} label="Position" value={dataToDisplay.position || "Not Set"} />
                        <ProfileDetailItem icon={FiAward} label="Primary Skill" value={dataToDisplay.skill || "Not Set"} />
                        <ProfileDetailItem icon={FiTag} label="Jersey #" value={dataToDisplay.jerseyNumber || 'N/A'} valueClass="text-lg font-bold" />
                        <ProfileDetailItem icon={FiStar} label="Current Score" value={dataToDisplay.score ?? 'N/A'} valueClass="text-lg font-bold text-sky-600" />
                    </div>
                    {dataToDisplay.bio && (
                        <div className="pt-3">
                            <ProfileDetailItem icon={FiInfo} label="Bio">
                                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">{dataToDisplay.bio}</p>
                            </ProfileDetailItem>
                        </div>
                    )}
                </div>
            </section>

            {/* --- My Enrollments Section --- */}
            <section className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
                <header className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2.5"><FiList /> My Club Enrollments</h2>
                    <Link to="/clubs" className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline">Browse Clubs →</Link>
                </header>
                {myEnrollments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Club</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Membership End Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {myEnrollments.map(enrollment => (
                                    <tr key={enrollment._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap"><Link to={`/club/${enrollment.club?._id}`} className="flex items-center gap-3 group">
                                            <img src={enrollment.club?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.club?.name?.charAt(0) || 'C')}&background=random`} alt={enrollment.club?.name} className="w-10 h-10 rounded-full object-cover border"/>
                                            <span className="text-sm font-semibold text-slate-800 group-hover:text-sky-600">{enrollment.club?.name || 'N/A'}</span>
                                        </Link></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(enrollment.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 inline-flex text-xs leading-tight font-semibold rounded-full border ${enrollment.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{enrollment.status}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(enrollment.endDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 px-6 text-center">
                        <p className="text-slate-500 text-lg">You are not currently enrolled in any clubs.</p>
                    </div>
                )}
            </section>

            {/* --- Payment History Section --- */}
            <section className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
                <header className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2.5"><FiClock /> Payment History</h2>
                </header>
                {paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">For Club</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {paymentHistory.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((payment) => (
                                    <tr key={payment._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(payment.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">{payment.clubName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-semibold">
                                            {payment.amountDetails?.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className={getPaymentStatusClass(payment.status)}>{payment.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-500 py-10 px-6 text-center text-lg">You have no payment history recorded yet.</p>
                )}
            </section>

            {isEditProfileModalOpen && dataToDisplay && (
                <UserProfileEditModal
                    isOpen={isEditProfileModalOpen}
                    onClose={() => setIsEditProfileModalOpen(false)}
                    currentUserData={dataToDisplay}
                    onProfileUpdated={handleProfileUpdated}
                />
            )}
        </div>
    );
};

export default PlayerDashboardPage;