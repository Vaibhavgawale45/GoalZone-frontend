// client/src/Pages/ClubDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";
import ClubPageSidebar from "../components/layouts/ClubPageSidebar.js"; // Corrected path assuming 'layout'
import EditClubModal from "../components/clubs/EditClubModal.js";
import { useAuth } from "../contexts/AuthContext.js";
import { toast } from 'react-toastify';

const ClubDetailPage = () => {
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
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState("");

  const fetchClubDetailsAndEnrollmentStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    setIsEnrolled(false);
    setEnrollmentSuccess("");
    setEnrollmentError("");
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
      if (user && user.role === "Player" && fetchedClubData.players) {
        const playerIsListed = fetchedClubData.players.some(
          (p) => p._id === user._id
        );
        setIsEnrolled(playerIsListed);
        if (playerIsListed)
          setEnrollmentSuccess("You are currently on this club's roster.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch club details."
      );
      setClub(null);
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
  };

  const nextImage = () =>
    typeof setCurrentCarouselImageIndex === "function" &&
    club?.carouselImages?.length &&
    setCurrentCarouselImageIndex((p) => (p + 1) % club.carouselImages.length);
  const prevImage = () =>
    typeof setCurrentCarouselImageIndex === "function" &&
    club?.carouselImages?.length &&
    setCurrentCarouselImageIndex(
      (p) => (p - 1 + club.carouselImages.length) % club.carouselImages.length
    );


  const handleEnroll = async () => {
    console.log("[handleEnroll] Clicked. User:", user, "Club:", club);
    setEnrollmentError('');
    setEnrollmentSuccess('');

    if (!user) { // Guest
      console.log("[handleEnroll] User is Guest. Showing toast and navigating to login.");
      
      // Show toast first
      toast.info("Please log in or create an account to enroll in this club.", {
        position: "top-center", // Example: position the toast
        autoClose: 3000,        // Auto close after 3 seconds
      });
      
      // Then navigate, passing the current location for redirection after login
      navigate("/login", {
        state: {
          from: location, // Preserve the current page location
          // The message in state is still useful if LoginPage wants to display it too
          loginMessage: "You need to login to enroll in a club.", 
        },
      });
      return; // Stop further execution
    }

    // Player enrollment logic (if user is logged in and is a Player)
    if (user.role === 'Player' && club && club._id) {
      setEnrollmentLoading(true);
      setEnrollmentError(''); setEnrollmentSuccess('');
      try {
        const payload = { clubId: club._id };
        console.log("[handleEnroll] Frontend: Sending enrollment payload:", payload);
        const response = await api.post('/enrollments', payload);
        console.log("[handleEnroll] Frontend: API response from /enrollments:", response.data);

        if (response.data && (response.data._id || response.data.message)) {
            toast.success(`Enrollment request for ${club.name} submitted! Status: ${response.data.paymentStatus || response.data.status || 'Pending'}`);
            // DON'T set isEnrolled(true) optimistically here yet. Let the refetch determine it.
            
            console.log("[handleEnroll] Frontend: Enrollment successful. Refetching club details to update roster...");
            await fetchClubDetailsAndEnrollmentStatus(); // <<<< CRUCIAL REFETCH
            // After refetch, the useEffect that depends on `club` or a new `isEnrolled` state based on `club.players` will update the UI.
        } else {
            console.error("[handleEnroll] Frontend: Unexpected response from enrollment API:", response.data);
            toast.warn("Enrollment submitted, but couldn't confirm status (unexpected response).");
        }
      } catch (err) {
        console.error("[handleEnroll] Frontend: Enrollment API call error:", err.response || err);
        toast.error(err.response?.data?.message || err.message || "Enrollment failed. Please try again.");
      } finally {
        setEnrollmentLoading(false);
      }
    }
  };

  const isManagingCoachForThisClub =
    user &&
    user.role === "Coach" &&
    user.isApproved &&
    club &&
    user.managedClub?._id === club._id;
  const isAdminUser = user && user.role === "Admin";
  const showMainSidebar =
    !!user &&
    (isAdminUser || isManagingCoachForThisClub || user.role === "Player");
  const canEditClub =
    isAdminUser ||
    (user &&
      user.role === "Coach" &&
      user.isApproved &&
      club &&
      club.coach &&
      user._id === club.coach._id);

  let showEnrollButton = false;
  if (!user) showEnrollButton = true;
  else if (user.role === "Player" && !isEnrolled) showEnrollButton = true;
  if (isAdminUser || isManagingCoachForThisClub) showEnrollButton = false;

  if (authLoading || (loading && !club))
    return (
      <div className="flex-center-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading Club Details...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex-center-screen error-container">
        <p className="error-title">Oops!</p>
        <p>{error}</p>
        <Link to="/" className="mt-6 btn-primary">
          Go Home
        </Link>
      </div>
    );
  if (!club)
    return (
      <div className="flex-center-screen">
        <p className="text-xl text-gray-700">Club not found.</p>
        <Link to="/" className="mt-6 btn-primary">
          Go Home
        </Link>
      </div>
    );

  const currentImage =
    club.carouselImages && club.carouselImages.length > 0
      ? club.carouselImages[currentCarouselImageIndex]
      : club.logoUrl ||
        "https://via.placeholder.com/1200x400.png?text=Club+Highlights";

  return (
    <div
      className={`flex flex-col ${
        showMainSidebar ? "md:flex-row" : ""
      } min-h-screen-minus-nav`}
    >
      {showMainSidebar && (
        <aside className="w-full md:w-64 lg:w-72 bg-gray-800 md:min-h-screen-minus-nav shadow-lg print:hidden flex-shrink-0">
          <ClubPageSidebar clubId={club._id} clubManagerId={club.coach?._id} />
        </aside>
      )}

      <main
        className={`w-full p-4 sm:p-6 lg:p-8 overflow-y-auto ${
          showMainSidebar ? "md:flex-grow" : "mx-auto max-w-5xl lg:max-w-6xl"
        }`}
      >
        {/* Hero Section */}
        <section className="relative mb-8 rounded-lg overflow-hidden shadow-xl bg-gray-700 min-h-[25rem] md:min-h-[30rem]">
          <img
            src={currentImage}
            alt={`${club.name} Highlight`}
            className="w-full h-full absolute inset-0 object-cover opacity-80"
          />
          {club.carouselImages && club.carouselImages.length > 1 && (
            <>
              <button onClick={prevImage} className="carousel-btn left-4">
                ❮
              </button>{" "}
              {/* Using actual chars */}
              <button onClick={nextImage} className="carousel-btn right-4">
                ❯
              </button>{" "}
              {/* Using actual chars */}
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 md:p-8 flex flex-col justify-between">
            {canEditClub ? (
              <div className="self-end z-10">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="edit-club-btn"
                >
                  Edit Club Info
                </button>
              </div>
            ) : (
              <div className="h-10" />
            )}
            <div className="flex items-center z-10">
              {club.logoUrl && (
                <img
                  src={club.logoUrl}
                  alt={`${club.name} Logo`}
                  className="club-logo-hero"
                />
              )}
              <div>
                <h1 className="hero-club-name">{club.name}</h1>
                {club.coach && club.coach.name && (
                  <p className="hero-coach-name">Coach: {club.coach.name}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- DESCRIPTION & ENROLL BUTTON/STATUS SECTION (RESTORED JSX) --- */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                About {club.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {club.description || "No description available."}
              </p>
              {club.location && (
                <p className="text-gray-500 mt-3">
                  <span className="font-medium">Location:</span> {club.location}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 sm:w-64 w-full mt-4 sm:mt-0">
              {" "}
              {/* Control width and margins */}
              {showEnrollButton && (
                <button
                  onClick={handleEnroll}
                  disabled={enrollmentLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {enrollmentLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Enroll in Club"
                  )}
                </button>
              )}
              {enrollmentError && (
                <p className="error-banner mt-3 text-sm">{enrollmentError}</p>
              )}
              {user &&
                user.role === "Player" &&
                isEnrolled &&
                !enrollmentError && (
                  <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm font-medium text-center border border-green-300 mt-3 shadow-sm">
                    <p>✓ You are part of this club's roster.</p>
                  </div>
                )}
              {/* Only show explicit success if not showing "already part of roster" and no current error */}
              {enrollmentSuccess &&
                !(user && user.role === "Player" && isEnrolled) &&
                !enrollmentError && (
                  <p className="success-banner mt-3 text-sm">
                    {enrollmentSuccess}
                  </p>
                )}
            </div>
          </div>
        </section>
        {/* --- END DESCRIPTION & ENROLL BUTTON/STATUS SECTION --- */}

        {/* Player Roster */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Player Roster ({club.players?.length || 0})
          </h2>
          {club.players && club.players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="th-style">Player</th>{" "}
                    <th className="th-style">Position</th>
                    <th className="th-style">Skill</th>{" "}
                    <th className="th-style">Rating</th>
                    {(isAdminUser || isManagingCoachForThisClub) && (
                      <th className="th-style">Email</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {club.players.map((player) => (
                    <tr
                      key={player._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="td-style flex items-center">
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-3 shadow-sm"
                          src={
                            player.imageUrl || "https://via.placeholder.com/40"
                          }
                          alt={player.name || "Player"}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {player.name || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="td-style">{player.position || "N/A"}</td>
                      <td className="td-style">{player.skill || "N/A"}</td>
                      <td className="td-style text-yellow-500 font-medium">
                        {player.rating !== null &&
                        typeof player.rating === "number" ? (
                          `${"★".repeat(Math.floor(player.rating))}${"☆".repeat(
                            5 - Math.floor(player.rating)
                          )} (${player.rating.toFixed(1)})`
                        ) : (
                          <span className="text-gray-400">Not Rated</span>
                        )}
                      </td>
                      {(isAdminUser || isManagingCoachForThisClub) && (
                        <td className="td-style">{player.email || "N/A"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : loading ? (
            <p>Loading roster...</p>
          ) : (
            <p className="text-gray-500">
              No players currently listed for this club.
            </p>
          )}
        </section>
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

export default ClubDetailPage;
