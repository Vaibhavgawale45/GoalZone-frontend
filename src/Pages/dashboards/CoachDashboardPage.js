// client/src/Pages/dashboards/CoachDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import api from '../../services/api.js';
import { Link, Navigate } from 'react-router-dom';

import CoachSidebar from '../../components/layouts/CoachSidebar.js';
import Modal from '../../components/shared/Modal.js'; // For Add Player
import EditClubModal from '../../components/clubs/EditClubModal.js';
import EditCoachProfileModal from '../../components/coach/EditCoachProfileModal.js';

const CoachDashboardPage = () => {
  const { user, setUser: setAuthUser } = useAuth();
  const [activeView, setActiveView] = useState('dashboardOverview');

  const [managedClub, setManagedClub] = useState(null);
  const [playersWithFees, setPlayersWithFees] = useState([]); // For player roster with fee info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCarouselImageIndex, setCurrentCarouselImageIndex] = useState(0);

  // Add New Player Modal States
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', 
    imageUrl: '', rating: '', skill: '', position: ''
  });
  const [addPlayerError, setAddPlayerError] = useState('');
  const [addPlayerSuccess, setAddPlayerSuccess] = useState('');
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);

  // Edit Club Modal State
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);
  // Edit Coach Profile Modal State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const fetchCoachData = useCallback(async () => {
    if (!user || user.role !== 'Coach' || !user.isApproved) {
      setLoading(false); setError("Access restricted or account not approved."); return;
    }
     // Only fetch club data if it's for the overview or player management
    if (activeView === 'coachProfile' && managedClub) { // if viewing profile and club data already loaded, no need to refetch club
        setLoading(false);
        return;
    }
    
    setLoading(true); setError('');
    try {
      const clubResponse = await api.get('/coaches/my-club');
      setManagedClub(clubResponse.data);
      setCurrentCarouselImageIndex(0);

      if (clubResponse.data && clubResponse.data._id) {
        const enrollmentsResponse = await api.get(`/coaches/my-club/enrollments`);
        const enrollments = enrollmentsResponse.data || [];
        const enrichedPlayers = (clubResponse.data.players || []).map(player => {
          const playerEnrollments = enrollments.filter(e => e.player?._id === player._id && e.paymentStatus === 'Paid').sort((a,b) => new Date(b.paymentDate || b.enrollmentDate) - new Date(a.paymentDate || a.enrollmentDate));
          const latestPaidEnrollment = playerEnrollments[0];
          return { ...player, feesPaid: latestPaidEnrollment?.paymentAmount, dateOfFees: latestPaidEnrollment?.paymentDate || latestPaidEnrollment?.enrollmentDate, paymentStatus: latestPaidEnrollment?.paymentStatus };
        });
        setPlayersWithFees(enrichedPlayers);
      } else {
        setPlayersWithFees([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch club data.");
      if(err.response?.status === 404 || err.response?.status === 403) { setManagedClub(null); }
    } finally {
      setLoading(false);
    }
  }, [user, activeView, managedClub]); // Add managedClub to prevent refetch if already loaded for profile view

  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  const handleClubUpdatedFromModal = (updatedClubData) => setManagedClub(updatedClubData);
  const handleProfileUpdatedFromModal = (updatedUserData) => {
    setAuthUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    alert("Profile updated successfully!");
  };

  const nextCarouselImage = () => {
    if (managedClub && managedClub.carouselImages && managedClub.carouselImages.length > 0) {
      setCurrentCarouselImageIndex((prev) => (prev === managedClub.carouselImages.length - 1 ? 0 : prev + 1));
    }
  };
  const prevCarouselImage = () => {
     if (managedClub && managedClub.carouselImages && managedClub.carouselImages.length > 0) {
      setCurrentCarouselImageIndex((prev) => (prev === 0 ? managedClub.carouselImages.length - 1 : prev - 1));
    }
  };

  const handleNewPlayerInputChange = (e) => setNewPlayerData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCreateAndAddPlayer = async (e) => {
    e.preventDefault(); setAddPlayerError(''); setAddPlayerSuccess('');
    if (newPlayerData.password !== newPlayerData.confirmPassword) { setAddPlayerError("Passwords do not match."); return; }
    if (!newPlayerData.name || !newPlayerData.email || !newPlayerData.password) {setAddPlayerError("Name, Email, Password required."); return; }
    setAddPlayerLoading(true);
    try {
      const { confirmPassword, ...playerData } = newPlayerData;
      if (playerData.rating === '' || isNaN(parseFloat(playerData.rating))) playerData.rating = null;
      else if (playerData.rating) playerData.rating = parseFloat(playerData.rating);
      const response = await api.post('/coaches/my-club/new-player', playerData);
      await fetchCoachData(); // Refetch to update combined player/fee list
      setAddPlayerSuccess(`Player '${response.data.player.name}' created and added!`);
      setNewPlayerData({ name: '', email: '', password: '', confirmPassword: '', phone: '', imageUrl: '', rating: '', skill: '', position: ''});
      setTimeout(() => { setAddPlayerSuccess(''); /* setIsAddPlayerModalOpen(false); */ }, 3000);
    } catch (err) { setAddPlayerError(err.response?.data?.message || "Failed to add player."); }
    finally { setAddPlayerLoading(false); }
  };
  const handleDeletePlayer = async (playerIdToRemove) => {
    if (window.confirm("Remove this player? This also removes their enrollments with this club.")) {
      try {
        await api.delete(`/coaches/my-club/players/${playerIdToRemove}`);
        await fetchCoachData();
        alert('Player removed.');
      } catch (err) { alert(`Error: ${err.response?.data?.message || "Failed to remove player."}`); }
    }
  };

  // --- RENDER LOGIC -----
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Coach') return <Navigate to="/unauthorized" replace />;
  if (!user.isApproved) return <Navigate to="/pending-approval" replace />;

  const renderClubOverviewContent = () => {
    if (loading && !managedClub) return <div className="text-center p-10"><div className="spinner"></div><p>Loading Your Club Data...</p></div>;
    if (error && !managedClub) return <div className="text-center p-10 error-banner"><h2>Error Loading Club Data</h2><p>{error}</p></div>;
    if (!managedClub) {
      return (
          <div className="text-center p-10">
              <p className="text-xl text-gray-700 mb-2">You are not currently assigned to manage a club.</p>
              {user.clubNameRegistered && <p className="text-gray-500">Your registration for "{user.clubNameRegistered}" might be awaiting final club assignment by an Admin.</p>}
              <p className="mt-3 text-gray-500">Please contact an administrator if you believe this is an error.</p>
              <Link to="/" className="mt-6 btn-primary">Go to Homepage</Link>
          </div>
      );
    }

    const currentHeroImage = managedClub.carouselImages?.[currentCarouselImageIndex] || managedClub.logoUrl || 'https://via.placeholder.com/1200x400.png?text=My+Club';
    return (
      <>
        {/* Club Hero Section */}
        <section className="relative mb-8 rounded-lg overflow-hidden shadow-xl bg-gray-700 min-h-[20rem] md:min-h-[24rem]">
          <img src={currentHeroImage} alt={`${managedClub.name} highlight`} className="w-full h-full absolute inset-0 object-cover opacity-80"/>
          {managedClub.carouselImages && managedClub.carouselImages.length > 1 && (
            <><button onClick={prevCarouselImage} className="carousel-btn left-4">❮</button><button onClick={nextCarouselImage} className="carousel-btn right-4">❯</button></>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 md:p-8 flex flex-col justify-between">
            <div className="self-end z-10"><button onClick={() => setIsEditClubModalOpen(true)} className="edit-club-btn">Edit Club Info</button></div>
            <div className="flex items-center z-10">
              {managedClub.logoUrl && <img src={managedClub.logoUrl} alt={`${managedClub.name} Logo`} className="club-logo-hero"/>}
              <div><h1 className="hero-club-name">{managedClub.name}</h1><p className="hero-coach-name">Managed by Coach {user.name}</p></div>
            </div>
          </div>
        </section>
        
        {/* About Club */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">About {managedClub.name}</h2>
            <p className="text-gray-600 leading-relaxed">{managedClub.description || 'No description available for this club.'}</p>
            {managedClub.location && <p className="text-gray-500 mt-3"><span className="font-medium">Location:</span> {managedClub.location}</p>}
        </section>

         {/* Action for adding players and player count - specific to Manage Players view now */}
      </>
    );
  };
  
  const renderManagePlayersView = () => {
    if (loading && !managedClub) return <div className="text-center p-10"><div className="spinner"></div><p>Loading Player Data...</p></div>;
    if (error && !managedClub) return <div className="text-center p-10 error-banner"><h2>Error Loading Players</h2><p>{error}</p></div>;
    if (!managedClub) return <div className="p-6 bg-white rounded-lg shadow-md text-gray-600">Please ensure your club details are loaded to manage players.</div>;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-700">Manage Players for {managedClub.name}</h2>
          <button onClick={() => setIsAddPlayerModalOpen(true)} className="btn-success text-sm">
            Create & Add Player
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">Total Players: {playersWithFees.length}</p>
        
        {playersWithFees.length === 0 ? (
            <p className="text-gray-500">No players currently in your club roster.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-style">Player</th><th className="th-style">Phone</th><th className="th-style">Position</th>
                  <th className="th-style">Skill</th><th className="th-style">Rating</th><th className="th-style">Fees Paid</th>
                  <th className="th-style">Date of Fees</th><th className="th-style">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playersWithFees.map(player => (
                  <tr key={player._id}>
                    <td className="td-style flex items-center">
                        <img className="h-8 w-8 rounded-full object-cover mr-2" src={player.imageUrl || 'https://via.placeholder.com/32'} alt={player.name} />
                        <span className="text-sm text-gray-900">{player.name}</span>
                    </td>
                    <td className="td-style">{player.phone || 'N/A'}</td>
                    <td className="td-style">{player.position || 'N/A'}</td>
                    <td className="td-style">{player.skill || 'N/A'}</td>
                    <td className="td-style text-yellow-500">{player.rating ? `${'★'.repeat(Math.floor(player.rating))}${'☆'.repeat(5 - Math.floor(player.rating))} (${player.rating.toFixed(1)})` : 'N/A'}</td>
                    <td className="td-style">{player.feesPaid ? `$${player.feesPaid.toFixed(2)}` : (player.paymentStatus || 'N/A')}</td>
                    <td className="td-style">{player.dateOfFees ? new Date(player.dateOfFees).toLocaleDateString() : 'N/A'}</td>
                    <td className="td-style"><button onClick={() => handleDeletePlayer(player._id)} className="text-red-600 hover:text-red-800 font-medium">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderCoachProfileView = () => {
    if (!user) return null; // Should be caught by ProtectedRoute
    const age = user.dateOfBirth ? (new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : 'N/A';
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <button onClick={() => setIsEditProfileModalOpen(true)} className="btn-primary text-sm">Edit Profile</button>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* ... (Profile details display - same as before) ... */}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-100">
      <aside className="w-60 md:w-64 bg-gray-800 text-white hidden md:flex md:flex-col fixed top-16 bottom-0 left-0 shadow-lg print:hidden z-30">
          <CoachSidebar setActiveView={setActiveView} />
      </aside>
      <main className="flex-1 p-6 md:ml-60 lg:md:ml-64 mt-16 md:mt-0 overflow-y-auto">
        {activeView === 'dashboardOverview' && renderClubOverviewContent()}
        {activeView === 'managePlayers' && renderManagePlayersView()}
        {activeView === 'coachProfile' && renderCoachProfileView()}
      </main>

      {/* Modals */}
      <Modal isOpen={isAddPlayerModalOpen} onClose={() => {setIsAddPlayerModalOpen(false); setAddPlayerError(''); setAddPlayerSuccess('');}} title="Create & Add New Player">
        <form onSubmit={handleCreateAndAddPlayer} className="space-y-4">
            {addPlayerError && <p className="error-banner">{addPlayerError}</p>} {addPlayerSuccess && <p className="success-banner">{addPlayerSuccess}</p>}
            {/* ... (Add Player Form Fields JSX - ensure all input-style, label-style are defined or use Tailwind) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="label-style">Full Name*</label><input type="text" name="name" value={newPlayerData.name} onChange={handleNewPlayerInputChange} required className="input-style" /></div><div><label className="label-style">Email*</label><input type="email" name="email" value={newPlayerData.email} onChange={handleNewPlayerInputChange} required className="input-style" /></div><div><label className="label-style">Password*</label><input type="password" name="password" value={newPlayerData.password} onChange={handleNewPlayerInputChange} required className="input-style" /></div><div><label className="label-style">Confirm Password*</label><input type="password" name="confirmPassword" value={newPlayerData.confirmPassword} onChange={handleNewPlayerInputChange} required className="input-style" /></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="label-style">Phone</label><input type="tel" name="phone" value={newPlayerData.phone} onChange={handleNewPlayerInputChange} className="input-style" /></div><div><label className="label-style">Image URL</label><input type="url" name="imageUrl" value={newPlayerData.imageUrl} onChange={handleNewPlayerInputChange} className="input-style"/></div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="label-style">Position</label><input type="text" name="position" value={newPlayerData.position} onChange={handleNewPlayerInputChange} className="input-style" /></div><div><label className="label-style">Primary Skill</label><input type="text" name="skill" value={newPlayerData.skill} onChange={handleNewPlayerInputChange} className="input-style" /></div><div><label className="label-style">Rating (1-5)</label><input type="number" name="rating" value={newPlayerData.rating} onChange={handleNewPlayerInputChange} min="0" max="5" step="0.1" className="input-style" /></div></div>
            <div className="flex justify-end space-x-3 pt-3"><button type="button" onClick={() => {setIsAddPlayerModalOpen(false); setAddPlayerError(''); setAddPlayerSuccess('');}} className="btn-secondary">Cancel</button><button type="submit" disabled={addPlayerLoading} className="btn-primary disabled:opacity-50">{addPlayerLoading ? 'Creating...' : 'Create & Add Player'}</button></div>
        </form>
      </Modal>
      {managedClub && isEditClubModalOpen && (
        <EditClubModal isOpen={isEditClubModalOpen} onClose={() => setIsEditClubModalOpen(false)} club={managedClub} onClubUpdated={handleClubUpdatedFromModal}/>
      )}
      {user && isEditProfileModalOpen && ( // Only render if user is available for coachData
        <EditCoachProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} coachData={user} onProfileUpdated={handleProfileUpdatedFromModal} />
      )}
      <style jsx global>{` /* ... (all .input-style, .label-style, .btn-*, .carousel-btn, etc. from before) ... */ `}</style>
    </div>
  );
};
export default CoachDashboardPage;