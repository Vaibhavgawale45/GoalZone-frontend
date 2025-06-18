// client/src/Pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import api from '../services/api.js';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfileEditModal from '../components/user/UserProfileEditModal.js';

// --- Import Icons from the utility file ---
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  TrophyIcon,
  InformationCircleIcon,
  StarIcon,
  PencilSquareIcon,
} from '../utils/iconUtils.js'; // Adjust path if needed
// --- End Icon Imports ---

// ... rest of UserProfilePage.js code remains the same ...
// (The createIcon and SVG definitions are removed from this file now)
// ...
const UserProfilePage = () => {
  const { user: authUser, setUser: setAuthUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/users/profile');
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
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [authUser, authLoading, fetchProfile, navigate, location]);

  const handleProfileUpdated = (updatedUserData) => {
    setProfileData(updatedUserData);
    setAuthUser(prev => ({ 
      ...prev, 
      ...updatedUserData,
      ...(updatedUserData.imageUrl && { imageUrl: updatedUserData.imageUrl }) 
    }));
    setIsEditModalOpen(false);
  };

  const ProfileDetailItem = ({ icon: IconComponent, label, value, valueClass = "text-slate-800", fullWidth = false, children }) => {
    if (!(value || value === 0 || typeof value === 'boolean' || children)) return null;
    return (
      <div className={`py-4 sm:py-5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
        <div className="flex items-start space-x-4">
          {IconComponent && <IconComponent className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />}
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            {children ? (
                <div className={`text-base md:text-lg ${valueClass} break-words mt-1`}>{children}</div>
            ) : (
                <p className={`text-base md:text-lg ${valueClass} break-words mt-1`}>{String(value)}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || loading || !profileData) {
    return ( 
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center">
        <div role="status">
            <svg aria-hidden="true" className="w-12 h-12 text-slate-300 animate-spin dark:text-slate-600 fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
        <p className="text-xl font-semibold text-slate-700 mt-5">Loading Your Profile...</p>
      </div>
    );
  }
  
  if (error) {
    return ( 
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-6 text-center">
        <InformationCircleIcon className="w-20 h-20 text-red-500 mb-5" />
        <p className="text-3xl font-semibold text-red-700 mb-3">Oops! An Error Occurred</p>
        <p className="text-slate-600 text-lg mb-8 max-w-md">{error}</p>
        <button 
          onClick={fetchProfile} 
          className="px-8 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-slate-100 p-8 sm:p-10 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={profileData.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'U')}&background=EBF4FF&color=3B82F6&size=160&font-size=0.5&bold=true`}
              alt={`${profileData.name}'s profile`}
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
            />
            <div className="text-center md:text-left flex-grow mt-4 md:mt-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">{profileData.name}</h1>
              <p className="text-sky-600 text-lg font-medium capitalize mt-1">{profileData.role}</p>
              {profileData.email && 
                <div className="flex items-center justify-center md:justify-start text-base text-slate-500 mt-2">
                    <EnvelopeIcon className="w-5 h-5 mr-2.5 text-slate-400" /> {profileData.email}
                </div>
              }
            </div>
            <div className="flex-shrink-0 mt-6 md:mt-0 w-full md:w-auto">
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                <PencilSquareIcon className="w-5 h-5 mr-2.5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-10">
            <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6 border-b border-slate-200 pb-3">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
                    <ProfileDetailItem icon={PhoneIcon} label="Phone" value={profileData.phone || "Not provided"} />
                    <ProfileDetailItem icon={CalendarDaysIcon} label="Date of Birth" value={profileData.dob ? new Date(profileData.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not provided"} />
                    {profileData.age !== undefined && profileData.age !== null && <ProfileDetailItem icon={UserCircleIcon} label="Age" value={`${profileData.age} years old`} />}
                    <ProfileDetailItem icon={TrophyIcon} label="Experience" value={profileData.experience || "Not specified"} />
                </div>
                {profileData.bio && (
                    <div className="mt-6">
                        <ProfileDetailItem icon={InformationCircleIcon} label="Bio" fullWidth>
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{profileData.bio}</p>
                        </ProfileDetailItem>
                    </div>
                )}
            </section>

            {profileData.role === 'Player' && (
                <section className="pt-8 border-t border-slate-200">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6 border-b border-slate-200 pb-3">Player Attributes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-2">
                        <ProfileDetailItem icon={UserCircleIcon} label="Position" value={profileData.position || "Not specified"} />
                        <ProfileDetailItem icon={TrophyIcon} label="Primary Skill" value={profileData.skill || "Not specified"} />
                        <ProfileDetailItem 
                            icon={StarIcon} 
                            label="Rating" 
                            valueClass={profileData.rating !== null && profileData.rating !== undefined ? "text-amber-500 font-semibold" : "text-slate-500"}
                        >
                            {profileData.rating !== null && profileData.rating !== undefined 
                                ? <span className="text-xl">{profileData.rating.toFixed(1)} / 5.0</span>
                                : "Not rated"}
                        </ProfileDetailItem>
                    </div>
                </section>
            )}

            {profileData.role === 'Coach' && (
                <section className="pt-8 border-t border-slate-200">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6 border-b border-slate-200 pb-3">Coach Information</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                        <ProfileDetailItem 
                            icon={InformationCircleIcon} 
                            label="Approval Status" 
                            valueClass={profileData.isApproved ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}
                        >
                            {profileData.isApproved ? "Approved" : "Pending Approval"}
                        </ProfileDetailItem>
                        {profileData.managedClub && (
                            <ProfileDetailItem 
                                icon={UserCircleIcon}
                                label="Managed Club" 
                                value={profileData.managedClub.name || "Not Assigned"} 
                            />
                        )}
                    </div>
                </section>
            )}
        </div>
      </div>

      {isEditModalOpen && (
        <UserProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUserData={profileData}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default UserProfilePage;