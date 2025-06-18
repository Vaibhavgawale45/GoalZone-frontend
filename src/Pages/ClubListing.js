// client/src/Pages/HomePage.js
import React, { useState, useEffect, useCallback } from "react";
import ClubCard from "../components/clubs/ClubCards.js"; // Ensure this path is correct
import api from "../services/api.js";

// Placeholder Icons - Consider moving to iconUtils.js and importing
const SearchIcon = ({ className = "w-5 h-5 text-gray-400" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);
const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044A23.53 23.53 0 0112 15c-2.755 0-5.455-.232-8.083-.678-.533-.09-.917-.556-.917-1.096V4.774c0-.54.384-1.006.917-1.096A23.53 23.53 0 0112 3zM3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5M3.75 19.5h16.5"
    />
  </svg>
);
const ResetIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
const LoadingSpinner = ({ small = false }) => (
  <div role="status" className="inline-block">
    <svg
      aria-hidden="true"
      className={`${
        small ? "w-6 h-6" : "w-10 h-10"
      } text-slate-200 animate-spin fill-sky-600`}
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);
const NoResultsIcon = () => (
  <svg
    className="mx-auto h-20 w-20 text-slate-300"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    />
  </svg>
);

const ClubListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // Use empty string for "Any Rating"
  const [locationFilter, setLocationFilter] = useState("");

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchClubsData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError("");
    try {
      // Only include params if they have a value
      const params = {};
      if (currentFilters.name) params.name = currentFilters.name;
      if (currentFilters.rating) params.rating = currentFilters.rating;
      if (currentFilters.location) params.location = currentFilters.location;

      const response = await api.get("/clubs", { params });
      if (response.data && Array.isArray(response.data.clubs)) {
        setClubs(response.data.clubs);
      } else {
        console.warn(
          "[HOMEPAGE] API Response data.clubs is missing or not an array.",
          response.data
        );
        setClubs([]);
      }
    } catch (err) {
      console.error("[HOMEPAGE] Fetch clubs error:", err.response || err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch clubs."
      );
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadComplete) {
      fetchClubsData({
        name: searchTerm,
        rating: ratingFilter,
        location: locationFilter,
      }).then(() => {
        setInitialLoadComplete(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubsData({
      name: searchTerm,
      rating: ratingFilter,
      location: locationFilter,
    });
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRatingFilter("");
    setLocationFilter("");
    fetchClubsData({}); // Fetch all clubs with empty filters
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  // Input and Button Styles (for consistency, can be moved to a shared UI/constants file)
  const inputStyle =
    "block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base placeholder-slate-400 transition-colors";
  const selectStyle = `${inputStyle} appearance-none bg-white pr-8`; // For custom arrow
  const labelStyle = "block text-sm font-medium text-slate-700 mb-1.5";
  const btnPrimary =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-70";
  const btnSecondary =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg shadow-sm hover:bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors";

  if (loading && !initialLoadComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-6">
        <LoadingSpinner />
        <p className="mt-4 text-lg font-medium text-slate-600">
          Loading available clubs...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 border border-slate-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-4 md:mb-0">
            Find Your Perfect Club
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${btnSecondary} md:hidden w-full justify-between`}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}{" "}
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className={`space-y-5 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-custom-filters md:gap-x-5 md:gap-y-5 md:items-end ${
            showFilters ? "block" : "hidden md:grid"
          }`}
        >
          <div className="relative md:col-span-1 lg:col-span-2">
            <label
              htmlFor="search-name"
              className={`${labelStyle} md:not-sr-only`}
            >
              Search by Club Name
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-10">
              <SearchIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="search-name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., City Rovers"
              className={`${inputStyle} pl-10`}
            />
          </div>

          <div>
            <label htmlFor="filter-location" className={labelStyle}>
              Location
            </label>
            <input
              type="text"
              id="filter-location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="e.g., Northwood"
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="filter-rating" className={labelStyle}>
              Minimum Rating
            </label>
            <select
              id="filter-rating"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={selectStyle}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1rem",
                paddingRight: "2rem",
                backgroundImage: `url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`,
              }}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 pt-2 md:pt-0 md:col-start-auto lg:col-start-4">
            <button
              type="submit"
              className={`${btnPrimary} w-full sm:w-auto py-2.5`}
            >
              <SearchIcon className="w-5 h-5 text-white mr-2" /> Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className={`${btnSecondary} w-full sm:w-auto py-2.5`}
            >
              <ResetIcon className="w-5 h-5 mr-2" /> Reset
            </button>
          </div>
        </form>
      </section>

      {loading && initialLoadComplete && (
        <div className="text-center py-8 flex items-center justify-center gap-2">
          <LoadingSpinner small />
          <p className="text-md text-slate-500">Searching clubs...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-red-700 bg-red-50 p-10 rounded-xl shadow-md border border-red-200">
          <p className="text-xl font-semibold">
            Could not load clubs at this time.
          </p>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => fetchClubsData({})}
            className={`${btnPrimary} mt-6`}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && clubs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}

      {!loading && !error && clubs.length === 0 && initialLoadComplete && (
        <div className="text-center py-16 bg-slate-50 rounded-xl shadow border border-slate-200 p-10">
          <NoResultsIcon />
          <h2 className="mt-6 text-2xl font-semibold text-slate-700">
            {searchTerm || locationFilter || ratingFilter
              ? "No Clubs Match Your Filters"
              : "No Clubs Available Yet"}
          </h2>
          <p className="mt-3 text-slate-500 max-w-md mx-auto">
            {searchTerm || locationFilter || ratingFilter
              ? "Try adjusting your search or filter criteria, or reset filters to see all clubs."
              : "Please check back later as new clubs are added!"}
          </p>
          {(searchTerm || locationFilter || ratingFilter) && (
            <button
              onClick={handleResetFilters}
              className={`${btnPrimary} mt-8`}
            >
              Clear Filters & Show All
            </button>
          )}
        </div>
      )}
      <style jsx global>{`
        .lg\\:grid-cols-custom-filters {
          grid-template-columns: 2fr 1fr 1fr auto;
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          /* md to lg- breakpoint */
          .lg\\:grid-cols-custom-filters {
            grid-template-columns: repeat(2, 1fr);
          }
          .lg\\:grid-cols-custom-filters > div:nth-child(1) {
            grid-column: span 2 / span 2;
          } /* Search Name full width */
          /* Buttons will stack or go side by side based on flex properties if needed */
          .lg\\:grid-cols-custom-filters > div:nth-child(4),
          .lg\\:grid-cols-custom-filters > div:nth-child(5) {
            grid-column: span 1; /* Make buttons take half width on this specific tablet view */
          }
        }
      `}</style>
    </div>
  );
};
export default ClubListing;
