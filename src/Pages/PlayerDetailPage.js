// client/src/Pages/PlayerDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';

// Assume you have these icon components defined in iconUtils.js or similar
// import { UserCircleIcon, EnvelopeIcon, PhoneIcon, CalendarDaysIcon, TrophyIcon, InformationCircleIcon, StarIcon, CreditCardIcon, PencilSquareIcon } from '../utils/iconUtils.js';

// Placeholder Icons if not using a library - REPLACE WITH YOUR ACTUAL ICONS
const UserCircleIcon = ({className="w-5 h-5"}) => <span className={className}>👤</span>;
const EnvelopeIcon = ({className="w-5 h-5"}) => <span className={className}>📧</span>;
const PhoneIcon = ({className="w-5 h-5"}) => <span className={className}>📞</span>;
const CalendarDaysIcon = ({className="w-5 h-5"}) => <span className={className}>📅</span>;
const TrophyIcon = ({className="w-5 h-5"}) => <span className={className}>🏆</span>;
const InformationCircleIcon = ({className="w-5 h-5"}) => <span className={className}>ℹ️</span>;
const StarIcon = ({className="w-5 h-5"}) => <span className={className}>⭐</span>;
const CreditCardIcon = ({className="w-5 h-5"}) => <span className={className}>💳</span>;
const PencilSquareIcon = ({className="w-4 h-4"}) => <span className={className}>✏️</span>; // For edit button
// ----

const LoadingSpinner = () => (
    <div role="status" className="flex justify-center items-center">
        <svg aria-hidden="true" className="w-10 h-10 text-slate-200 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <span className="sr-only">Loading...</span>
    </div>
);
const ErrorDisplay = ({ message, onRetry, itemType = "Player Details" }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 min-h-[30vh]">
        <InformationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-700 mb-2">Error Loading {itemType}</p>
        <p className="text-slate-600 mb-6 max-w-md">{message}</p>
        {onRetry && <button onClick={onRetry} className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Try Again</button>}
    </div>
);

const ProfileDetailItem = ({ icon: IconComponent, label, value, valueClass = "text-slate-800", fullWidth = false, children }) => {
    if (!(value || value === 0 || typeof value === 'boolean' || children)) return null;
    return (
      <div className={`py-3.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        <div className="flex items-start gap-3">
          {IconComponent && <IconComponent className="w-5 h-5 text-sky-600 flex-shrink-0 mt-1" />}
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            {children ? (
                <div className={`text-sm md:text-base ${valueClass} break-words`}>{children}</div>
            ) : (
                <p className={`text-sm md:text-base ${valueClass} break-words`}>{String(value)}</p>
            )}
          </div>
        </div>
      </div>
    );
};

const PlayerDetailPage = () => {
  const { playerId } = useParams();
  const { user: currentUser } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlayerDetails = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get(`/users/${playerId}/details`);
      setPlayer(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch player details.");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerDetails();
  }, [fetchPlayerDetails]);
  
  const formatDate = (dateString) => {
    if (!dateString) return <span className="italic text-slate-400">N/A</span>;
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getPaymentStatusClass = (status) => {
    const base = "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border";
    switch (status?.toLowerCase()) {
      case 'paid': return `${base} bg-green-100 text-green-800 border-green-300`;
      case 'due': return `${base} bg-yellow-100 text-yellow-800 border-yellow-300`;
      case 'overdue': return `${base} bg-red-100 text-red-800 border-red-300`;
      case 'waived': return `${base} bg-blue-100 text-blue-800 border-blue-300`;
      default: return `${base} bg-slate-200 text-slate-700 border-slate-400`;
    }
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-6"><LoadingSpinner /><p className="mt-4 text-lg font-medium text-slate-600">Loading Player Details...</p></div>;
  }
  if (error) {
    return <div className="max-w-2xl mx-auto py-10 px-4"><ErrorDisplay message={error} onRetry={fetchPlayerDetails} /></div>;
  }
  if (!player) {
    return <div className="max-w-2xl mx-auto py-10 px-4"><ErrorDisplay message="Player data not found." itemType="Player"/></div>;
  }

  const isViewingOwnProfile = currentUser?._id === player._id;
  // This check assumes 'enrolledClubs' is an array of objects on the player, each having a 'club' field with the club's ID.
  // Adjust if your player data structure for club enrollments is different.
  const isCoachViewingPlayerInTheirClub = 
    currentUser?.role === 'Coach' && 
    currentUser.isApproved &&
    player.enrolledClubs?.some(enrollment => typeof enrollment.club === 'string' ? enrollment.club === currentUser.managedClub?._id : enrollment.club?._id === currentUser.managedClub?._id);


  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Player Header Card */}
      <header className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 border border-slate-200">
        <div className="bg-slate-50 p-6 sm:p-8"> {/* Lighter header background */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name || 'P')}&size=128&background=EBF4FF&color=3B82F6&font-size=0.5&bold=true`}
              alt={`${player.name}'s profile`}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
            />
            <div className="text-center sm:text-left flex-grow mt-2 sm:mt-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">{player.name}</h1>
              <p className="text-sky-600 text-lg font-medium capitalize">{player.role}</p>
              {player.email && 
                <div className="flex items-center justify-center sm:justify-start text-sm text-slate-500 mt-2">
                    <EnvelopeIcon className="w-4 h-4 text-slate-400"/> <span className="ml-2">{player.email}</span>
                </div>
              }
              {(isViewingOwnProfile || currentUser?.role === 'Admin') && (
                  <Link 
                    to={isViewingOwnProfile ? "/profile" : `/admin/manage-users/edit/${player._id}`}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    <PencilSquareIcon /> Edit Full Profile
                  </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <section className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-1 border-b border-slate-200 pb-3">Player Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-2">
              <ProfileDetailItem icon={PhoneIcon} label="Phone" value={player.phone || "Not provided"} />
              <ProfileDetailItem icon={CalendarDaysIcon} label="Date of Birth" value={player.dob ? formatDate(player.dob) : "Not provided"} />
              {player.age !== null && player.age !== undefined && <ProfileDetailItem icon={UserCircleIcon} label="Age" value={`${player.age} years`} />}
              <ProfileDetailItem icon={TrophyIcon} label="Experience" value={player.experience || "Not specified"} />
              <ProfileDetailItem icon={InformationCircleIcon} label="Position" value={player.position || "Not specified"} />
              <ProfileDetailItem icon={TrophyIcon} label="Primary Skill" value={player.skill || "Not specified"} />
              <ProfileDetailItem icon={StarIcon} label="Score" value={player.score !== null && player.score !== undefined ? String(player.score) : "Not set"} valueClass="text-2xl font-bold text-sky-600" />
            </div>
            {player.bio && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <ProfileDetailItem icon={InformationCircleIcon} label="Bio" fullWidth>
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{player.bio}</p>
                </ProfileDetailItem>
              </div>
            )}
          </div>
        </section>

        {(player.createdByCoach || player.paymentHistory?.length > 0 || isCoachViewingPlayerInTheirClub) && (
          <section className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b border-slate-200 pb-3">Payment Details</h2>
              {player.createdByCoach && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 mb-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0 last:mb-0">
                    <ProfileDetailItem icon={CreditCardIcon} label="Current Club Status" children={<span className={getPaymentStatusClass(player.paymentStatus)}>{player.paymentStatus || 'N/A'}</span>} />
                    <ProfileDetailItem icon={CalendarDaysIcon} label="Last Payment Date" value={formatDate(player.lastPaymentDate)} />
                    <ProfileDetailItem icon={CalendarDaysIcon} label="Next Due Date" value={formatDate(player.nextDueDate)} />
                </div>
              )}
              
              {player.paymentHistory && player.paymentHistory.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-slate-600 mb-3">Monthly Payment Log</h3>
                  <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Month/Year</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {player.paymentHistory.sort((a,b) => new Date(b.year, new Date(Date.parse(b.month +" 1, 2000")).getMonth()) - new Date(a.year, new Date(Date.parse(a.month +" 1, 2000")).getMonth())).map((record, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-medium">{record.month} {record.year}</td>
                            <td className="px-4 py-3 whitespace-nowrap"><span className={getPaymentStatusClass(record.status)}>{record.status}</span></td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right">{record.amountPaid ? `$${record.amountPaid.toFixed(2)}` : <span className="italic text-slate-400">N/A</span>}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDate(record.paymentDate)}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate" title={record.notes}>{record.notes || <span className="italic text-slate-400">-</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                (player.createdByCoach || isCoachViewingPlayerInTheirClub) && <p className="text-sm text-slate-500 italic">No detailed payment history logged for this player yet.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PlayerDetailPage;