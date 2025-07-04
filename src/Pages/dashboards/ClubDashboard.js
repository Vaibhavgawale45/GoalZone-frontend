import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api.js";
import ClubPageSidebar from "../../components/layouts/ClubPageSidebar.js";
import EditClubModal from "../../components/clubs/EditClubModal.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { toast } from "react-toastify";

// --- NEWLY IMPORTED COMPONENT ---
import Leaderboard from "../../components/clubs/Leaderboard.js";

// --- ICON COMPONENTS (Kept as they are used outside the leaderboard) ---
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// --- GENERAL UI HELPER COMPONENTS ---
const LoadingSpinner = () => (
  <div role="status">
    <svg aria-hidden="true" className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 animate-spin fill-sky-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);
const ErrorStateDisplay = ({ message, onRetry }) => (
  <div className="min-h-[30vh] flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <p className="text-xl font-semibold text-red-700 mb-2">Oops! Something Went Wrong</p>
    <p className="text-slate-600 mb-6 max-w-md">{message}</p>
    {onRetry && <button onClick={onRetry} className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Try Again</button>}
  </div>
);
const NotFoundDisplay = ({ itemType = "Club" }) => (
  <div className="min-h-[30vh] flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <p className="text-xl font-semibold text-slate-700 mb-2">{itemType} Not Found</p>
    <p className="text-slate-500 mb-6">We couldn't find the {itemType.toLowerCase()} you're looking for.</p>
    <Link to="/" className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Browse Clubs</Link>
  </div>
);

// --- LEADERBOARD HELPER COMPONENTS (PodiumItem, CurrentUserRankBar, LeaderboardListItem etc.) have been REMOVED ---
// --- They are now encapsulated within the Leaderboard component. ---


const ClubDashboard = () => {
  const { clubId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentCarouselImageIndex, setCurrentCarouselImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const carouselIntervalRef = useRef(null);

  const fetchClubDetailsAndEnrollmentStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    setIsEnrolled(false);
    try {
      const response = await api.get(`/clubs/${clubId}`);
      const fetchedClubData = response.data;
      if (!fetchedClubData) {
        setError("Club data could not be loaded.");
        setClub(null);
        setLoading(false);
        return;
      }
      setClub(fetchedClubData);
      setCurrentCarouselImageIndex(0);
      if (user && user?.role === "Player" && fetchedClubData.players) {
        setIsEnrolled(fetchedClubData.players.some((p) => p._id === user._id));
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
         setClub(null);
         setError("");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to fetch club details.");
        setClub(null);
      }
    } finally {
      setLoading(false);
    }
  }, [clubId, user]);

  useEffect(() => {
    if (clubId && !authLoading) {
        fetchClubDetailsAndEnrollmentStatus();
    }
  }, [clubId, authLoading, fetchClubDetailsAndEnrollmentStatus]);

  const handleClubUpdated = (updatedClubData) => {
    setClub(updatedClubData);
    toast.success("Club details updated successfully!");
  };

  const nextImage = useCallback(() => {
    if (club?.carouselImages?.length > 1) {
      setCurrentCarouselImageIndex((prev) => (prev + 1) % club.carouselImages.length);
    }
  }, [club?.carouselImages]);

  const prevImage = () => {
    if (club?.carouselImages?.length > 1) {
      setCurrentCarouselImageIndex((prev) => (prev - 1 + club.carouselImages.length) % club.carouselImages.length);
    }
  };

  useEffect(() => {
    if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    if (club?.carouselImages?.length > 1) {
      carouselIntervalRef.current = setInterval(nextImage, 4000);
    }
    return () => {
      if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
    };
  }, [club?.carouselImages, nextImage]);

  const handleEnroll = async () => {
    if (!user) {
      toast.info("Please log in to enroll.", { autoClose: 3000 });
      navigate("/login", { state: { from: location } });
      return;
    }
    if (user?.role === "Player" && club?._id) {
      setEnrollmentLoading(true);
      try {
        await api.post("/enrollments", { clubId: club._id });
        toast.success(`Enrollment request for ${club.name} submitted!`);
        await fetchClubDetailsAndEnrollmentStatus();
      } catch (err) {
        toast.error(err.response?.data?.message || "Enrollment failed.");
      } finally {
        setEnrollmentLoading(false);
      }
    }
  };

  const isManagingCoachForThisClub = user?.role === "Coach" && user.isApproved && club && user.managedClub?._id === club._id;
  const isAdminUser = user?.role === "Admin";
  const isCoachViewingAnyClub = user?.role === "Coach" && club;
  const showMainSidebar = (isManagingCoachForThisClub || isCoachViewingAnyClub || isAdminUser) && club;
  const canEditClub = isAdminUser || isManagingCoachForThisClub;

  const showEnrollButton = !authLoading &&
                         club &&
                         user &&
                         user?.role === "Player" &&
                         !isEnrolled &&
                         !isAdminUser &&
                         !isManagingCoachForThisClub;


  // --- REMOVED LOGIC: `sortedPlayers`, `top3Players`, `currentUserDataInRoster`, `listPlayers` ---
  // This is now all handled inside the Leaderboard component.

  if (authLoading || (loading && !club && !error)) {
    return (
      <div className="min-h-screen-minus-nav flex flex-col items-center justify-center bg-slate-50 p-6">
        <LoadingSpinner />
        <p className="text-lg font-semibold text-slate-700 mt-4">Loading Club Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8"><ErrorStateDisplay message={error} onRetry={fetchClubDetailsAndEnrollmentStatus}/></div>
    );
  }
  if (!club) {
    return (
      <div className="p-4 sm:p-6 lg:p-8"><NotFoundDisplay itemType="Club" /></div>
    );
  }

  const currentImageSrc = club.carouselImages?.length > 0 ? club.carouselImages[currentCarouselImageIndex] : club.logoUrl || "https://via.placeholder.com/1200x500/E2E8F0/475569.png?text=Club+Highlights";

  return (
    <div className={`flex flex-col ${showMainSidebar ? "md:flex-row" : ""} min-h-screen-minus-nav bg-slate-100`}>
      {showMainSidebar && (
        <aside className="w-full md:w-60 lg:w-64 xl:w-72 bg-white md:bg-slate-50 border-r border-slate-200 md:min-h-screen-minus-nav shadow-sm print:hidden flex-shrink-0">
          <ClubPageSidebar clubId={club._id} />
        </aside>
      )}

      <main className={`w-full overflow-y-auto ${showMainSidebar ? "md:flex-grow" : ""}`}>
        {/* Carousel and Header Section - Unchanged */}
        <section className="relative bg-slate-800 text-white group">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
            <img src={currentImageSrc} alt={`${club.name} Highlight`} className="w-full h-full object-cover"/>
          </div>
          {club.carouselImages && club.carouselImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 z-30 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Previous image"><ChevronLeftIcon /></button>
              <button onClick={nextImage} className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-30 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Next image"><ChevronRightIcon /></button>
            </>
          )}
          {club.qrCodeUrl && (
              <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white p-2 sm:p-2.5 rounded-lg shadow-xl border-2 border-sky-300/60 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
                      <a href={club.clubProfileUrl || '#'} target="_blank" rel="noopener noreferrer" title="Visit Club Page (QR Link)" className="block w-full h-full">
                          <img src={club.qrCodeUrl} alt={`${club.name} QR Code`} className="w-full h-full object-contain" />
                      </a>
                  </div>
                  <p className="text-center text-xxs sm:text-xs text-white/90 mt-1.5 font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">Scan to visit</p>
              </div>
          )}
          <div className="relative z-10 flex flex-col justify-between min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {club.logoUrl && <img src={club.logoUrl} alt={`${club.name} Logo`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm p-1 sm:p-1.5 border-2 border-white/40 shadow-lg flex-shrink-0"/>}
                <div><h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">{club.name}</h1></div>
              </div>
              {canEditClub && <button onClick={() => setIsEditModalOpen(true)} className="flex-shrink-0 ml-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors">Edit Club</button>}
            </div>
            {club.coach && club.coach.name && (<div className="self-end mt-auto pt-4"><p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">Coached by: <span className="font-semibold text-white">{club.coach.name}</span></p></div>)}
          </div>
        </section>

        <div className={`p-4 sm:p-6 lg:p-8 ${!showMainSidebar && "max-w-5xl lg:max-w-6xl mx-auto"}`}>
          {/* --- PLAYER LEADERBOARD SECTION --- */}
          <section className="bg-transparent"> {/* Changed bg to transparent as Leaderboard provides its own */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2 text-center">
              Player Leaderboard
            </h2>
            <p className="text-center text-slate-500 mb-6 sm:mb-8">
                ({club?.players?.length || 0} players)
            </p>
            
            {/* --- REPLACEMENT --- */}
            {/* The old complex rendering logic is replaced by this single component call */}
            <Leaderboard
                players={club?.players || []}
                user={user}
                loading={loading}
                isManagingCoachForThisClub={isManagingCoachForThisClub}
            />
            {/* --- END REPLACEMENT --- */}

          </section>
        </div>
      </main>

      {canEditClub && club && (
        <EditClubModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          club={club}
          onClubUpdated={handleClubUpdated}
        />
      )}
    </div>
  );
};

export default ClubDashboard;