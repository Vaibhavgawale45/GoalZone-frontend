// client/src/Pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import UserProfileEditModal from '../components/user/UserProfileEditModal.js'; // We'll create this

// Placeholder Icons (replace with a real icon library if desired)
const ProfileIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const EmailIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const PhoneIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>;
const CalendarIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12v-.008z" /></svg>;
const TrophyIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3 3 0 0012 9.75h0A3 3 0 007.5 14.25v4.5m9.375-3.188A2.625 2.625 0 1115 15.062a2.625 2.625 0 015.25 0c0 .654-.221 1.253-.598 1.751L15 21.75H9.375c-.377 0-.728-.155-.98-.402L3.598 16.813a2.625 2.625 0 01-.597-1.751 2.625 2.625 0 015.25 0 2.625 2.625 0 01-.598 1.751L3 21.75m18-18L9 3m12 0L9 3M6 21.75L9 3" /></svg>;
const InfoIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const StarIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.543 2.86c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;


const UserProfilePage = () => {
  const { user: authUser, setUser: setAuthUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null); // Will hold the user data to display
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // For initial profile fetch
  const [error, setError] = useState(''); // For fetch errors
  // Success message for updates can be handled within the modal or via a toast library

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/users/profile'); // Fetches current user's profile
      setProfileData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchProfile();
    } else if (!authLoading && !authUser) {
      navigate('/login', { replace: true });
    }
  }, [authUser, authLoading, fetchProfile, navigate]);

  const handleProfileUpdated = (updatedUserData) => {
    setProfileData(updatedUserData); // Update displayed profile data
    setAuthUser(prev => ({ ...prev, ...updatedUserData })); // Update AuthContext
    setIsEditModalOpen(false); // Close modal
    // Optionally show a success message/toast here
  };

  const ProfileDetailItem = ({ icon: IconComponent, label, value, valueClass = "text-gray-700" }) => (
    value || value === 0 ? ( // Check for 0 in case of rating
      <div className="flex items-center space-x-3 py-3">
        <IconComponent className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-sm sm:text-base ${valueClass}`}>{value}</p>
        </div>
      </div>
    ) : null
  );


  if (authLoading || loading || !profileData) {
    return <div className="flex-center-screen"><div className="spinner"></div><p className="loading-text">Loading Your Profile...</p></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {error && <p className="error-banner mb-6">{error}</p>}
      
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={profileData.imageUrl || 'https://via.placeholder.com/120x120.png?text=User'}
              alt={`${profileData.name}'s profile`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-300 shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profileData.name}</h1>
              <p className="text-indigo-200 text-lg">{profileData.role}</p>
              <p className="text-sm text-indigo-100 mt-1">{profileData.email}</p>
            </div>
            <div className="sm:ml-auto pt-4 sm:pt-0">
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="btn-primary bg-white text-indigo-600 hover:bg-indigo-50 focus:ring-white w-full sm:w-auto"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
            
            {/* General Info Section */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <ProfileDetailItem icon={PhoneIcon} label="Phone" value={profileData.phone || "Not provided"} />
                    <ProfileDetailItem icon={CalendarIcon} label="Date of Birth" value={profileData.dob ? new Date(profileData.dob).toLocaleDateString() : "Not provided"} />
                    {profileData.age !== null && <ProfileDetailItem icon={ProfileIcon} label="Age" value={`${profileData.age} years old`} />}
                    <ProfileDetailItem icon={TrophyIcon} label="Experience" value={profileData.experience || (profileData.role === 'Coach' ? "Not specified" : "Not specified")} />
                </div>
                {profileData.bio && (
                    <div className="mt-4">
                        <ProfileDetailItem icon={InfoIcon} label="Bio" value={profileData.bio} />
                    </div>
                )}
            </section>

            {/* Player Specific Details */}
            {profileData.role === 'Player' && (
                <section className="pt-6 border-t mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Player Attributes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                        <ProfileDetailItem icon={InfoIcon} label="Position" value={profileData.position || "Not specified"} />
                        <ProfileDetailItem icon={InfoIcon} label="Primary Skill" value={profileData.skill || "Not specified"} />
                        <ProfileDetailItem 
                            icon={StarIcon} 
                            label="Rating" 
                            value={profileData.rating !== null ? `${profileData.rating.toFixed(1)} / 5.0` : "Not rated"} 
                            valueClass={profileData.rating !== null ? "text-yellow-500 font-bold" : "text-gray-500"}
                        />
                    </div>
                </section>
            )}
             {/* Coach Specific Details (if any beyond experience/bio) could go here */}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <UserProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUserData={profileData} // Pass current data to pre-fill modal
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      <style jsx global>{`
        /* Add relevant global styles here or ensure they are in index.css */
        .flex-center-screen { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: calc(100vh - 8rem); }
        .spinner { /* ... */ } .loading-text { /* ... */ }
        .error-banner { /* ... */ } .success-banner { /* ... */ }
        .btn-primary { @apply px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors; }
        .btn-secondary { @apply px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors; }
        .input-style { /* ... */ } .label-style { /* ... */ }
      `}</style>
    </div>
  );
};

export default UserProfilePage;