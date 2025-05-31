// client/src/Pages/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import ClubCard from '../components/clubs/ClubCards.js';
import api from '../services/api.js';

// SVG Icon components (can be moved to a separate file)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044A23.53 23.53 0 0112 15c-2.755 0-5.455-.232-8.083-.678-.533-.09-.917-.556-.917-1.096V4.774c0-.54.384-1.006.917-1.096A23.53 23.53 0 0112 3zM3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5M3.75 19.5h16.5" />
    </svg>
);
const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);


const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true); // For initial load and subsequent searches
  const [error, setError] = useState('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [showFilters, setShowFilters] = useState(false); // For mobile filter toggle

  // Memoized fetchClubs function to prevent unnecessary recreation
  const fetchClubs = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) { // Don't show full page loader for filter changes if data already exists
        setLoading(true);
    } else {
        setLoading(true); // Show full page loader only for the very first load
    }
    setError('');
    
    try {
      const params = {};
      // Only add params if they have values, for the explicit search through button
      if (searchTerm) params.name = searchTerm;
      if (ratingFilter && ratingFilter !== 'any') params.rating = ratingFilter;
      if (locationFilter) params.location = locationFilter;

      console.log("[HOMEPAGE] Fetching clubs with params:", params);
      const response = await api.get('/clubs', { params });
      setClubs(response.data);
    } catch (err) {
      console.error("[HOMEPAGE] Fetch clubs error:", err.response || err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch clubs.');
      setClubs([]); // Clear clubs on error
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setInitialLoadComplete(true);
      }
    }
  }, [searchTerm, ratingFilter, locationFilter]); // Dependencies for useCallback

  // Initial data load
  useEffect(() => {
    console.log("[HOMEPAGE] Initial load effect triggered.");
    fetchClubs(true); // Pass true for initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once after initial render

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("[HOMEPAGE] Search button clicked/form submitted.");
    fetchClubs(false); // Explicit search, not initial load
    if (window.innerWidth < 768) { // md breakpoint
        setShowFilters(false); // Optionally hide filters on mobile after search
    }
  };

  const handleResetFilters = () => {
    console.log("[HOMEPAGE] Reset filters clicked.");
    setSearchTerm('');
    setRatingFilter('');
    setLocationFilter('');
    // Fetch clubs with empty filters, which should give all clubs
    // We need to temporarily set loading true for this specific action if we don't want useEffect to do it.
    // But since fetchClubs is now called directly, we can rely on its internal loading state.
    // To make fetchClubs re-run with new empty values:
    // 1. Clear state (done)
    // 2. Call fetchClubs. The useCallback will use the latest states next time it's called.
    // For immediate refetch after reset:
    // Option A: directly call after state updates (might have stale state due to async nature of setState)
    // Option B: Use a useEffect that depends on a "trigger" state, or let the existing useCallback structure handle it on next search.
    // For simplicity and best UX with a reset button:
    // We'll fetch specifically with empty params after reset.
    const currentSearchTerm = searchTerm;
    const currentLocationFilter = locationFilter;
    const currentRatingFilter = ratingFilter;

    // If any filter was active, then perform a fetch to reset the view
    if (currentSearchTerm || currentLocationFilter || currentRatingFilter) {
        // Temporarily set filters to empty for This call before calling fetchClubs with its own logic
        // Or ensure fetchClubs gets called after state is truly updated.
        // The easiest is to manage the params explicitly for reset's fetchClubs call
        setLoading(true); setError('');
        api.get('/clubs', { params: {} }) // Fetch all
            .then(response => setClubs(response.data))
            .catch(err => setError(err.response?.data?.message || err.message || 'Failed to fetch clubs.'))
            .finally(() => setLoading(false));
    }
    if (window.innerWidth < 768) {
        setShowFilters(false);
    }
  };


  if (loading && !initialLoadComplete) {
    return <div className="text-center py-20"><div className="spinner"></div><p className="mt-3 text-gray-600">Loading available clubs...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        {/* Title and Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Find Your Perfect Club
            </h2>
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden btn-secondary flex items-center justify-center w-full"
            >
                <FilterIcon /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className={`space-y-5 md:space-y-0 md:grid md:grid-cols-custom-filters md:gap-x-4 md:gap-y-5 md:items-end ${showFilters ? 'block' : 'hidden md:grid'}`}>
          {/* Search by Name */}
          <div className="relative md:col-span-2"> {/* Search takes more space on md+ */}
            <label htmlFor="search-name" className="label-style sr-only md:not-sr-only">Club Name</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-7 md:top-auto"> {/* Adjust top for label presence */}
              <SearchIcon />
            </div>
            <input type="text" id="search-name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search clubs..." className="input-style pl-10 pr-3 py-2.5 text-base mt-1 md:mt-0"/>
          </div>

          {/* Filter by Location */}
          <div>
            <label htmlFor="filter-location" className="label-style">Location</label>
            <input type="text" id="filter-location" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                   placeholder="e.g., North City" className="input-style py-2.5 text-base mt-1 md:mt-0"/>
          </div>
          
          {/* Filter by Rating */}
          <div>
            <label htmlFor="filter-rating" className="label-style">Minimum Rating</label>
            <select id="filter-rating" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
                    className="input-style appearance-none py-2.5 text-base bg-white mt-1 md:mt-0">
              <option value="any">Any Rating</option>
              <option value="4.5">4.5+ Stars</option><option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option><option value="3">3+ Stars</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3 md:col-start-auto"> {/* Control button placement */}
            <button type="submit" className="btn-primary w-full md:w-auto flex items-center justify-center py-2.5 text-base">
                <SearchIcon /> <span className="ml-2">Search</span>
            </button>
            <button type="button" onClick={handleResetFilters} className="btn-secondary w-full md:w-auto flex items-center justify-center py-2.5 text-base">
                <ResetIcon /> <span className="ml-2">Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* Club Listing Section */}
      {loading && initialLoadComplete && <div className="text-center py-4"><div className="spinner-small"></div><p className="text-sm text-gray-500">Searching clubs...</p></div>}
      
      {!loading && error && (
         <div className="text-center py-16 text-red-600 bg-red-50 p-8 rounded-lg shadow-md"><p className="text-xl font-semibold">Could not load clubs.</p><p>{error}</p></div>
      )}

      {!loading && !error && clubs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {clubs.map(club => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}
      
      {!loading && !error && clubs.length === 0 && initialLoadComplete && (
          <div className="text-center py-16 bg-gray-50 rounded-lg shadow">
            <svg className="mx-auto h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" /* ... icon ... */>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-3 3l-3-3m0 0l-3 3m3-3v6" />
            </svg>
            <h3 className="mt-6 text-2xl font-semibold text-gray-700">No Clubs Found</h3>
            <p className="mt-3 text-gray-500">Try adjusting your search or filter criteria.</p>
            <button onClick={handleResetFilters} className="mt-8 btn-primary">
                Clear Filters & Show All
            </button>
          </div>
      )}

      <style jsx global>{`
        /* ... (spinner, input-style, label-style, btn-primary, btn-secondary from previous example) ... */
        .md\\:grid-cols-custom-filters { grid-template-columns: 2fr 1fr 1fr auto; } /* Custom grid for filters on medium screens */
        @media (max-width: 1023px) and (min-width: 768px) { /* Between md and lg */
          .md\\:grid-cols-custom-filters { grid-template-columns: repeat(2, 1fr); } /* Stack to 2x2 on tablet */
          .md\\:grid-cols-custom-filters > div:nth-child(1) { grid-column: span 2 / span 2; } /* Search takes full width first row */
          .md\\:grid-cols-custom-filters > div:nth-child(4) { grid-column: span 2 / span 2; } /* Buttons take full width last row */
        }

        .spinner { border: 5px solid rgba(239, 246, 255, 0.3); width: 50px; height: 50px; border-radius: 50%; border-left-color: #4F46E5; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
        .spinner-small { border: 3px solid rgba(0, 0, 0, 0.1); width: 24px; height: 24px; border-radius: 50%; border-left-color: #4F46E5; animation: spin 1s linear infinite; margin: 0 auto 0.5rem;}
        @keyframes spin { to { transform: rotate(360deg); } }

        .input-style { display: block; width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
        .input-style:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); }
        .input-style.pl-10 { padding-left: 2.5rem; }
        select.input-style {
            background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>');
            background-position: right 0.75rem center; background-repeat: no-repeat; background-size: 1.25em 1.25em; padding-right: 2.5rem;
        }
        .label-style { display: block; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
        .btn-primary { padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; transition: background-color 0.15s ease-in-out; border: none; cursor: pointer; }
        .btn-primary:hover { background-color: #4338CA; }
        .btn-secondary { padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; border: 1px solid #D1D5DB; transition: background-color 0.15s ease-in-out; cursor: pointer; }
        .btn-secondary:hover { background-color: #E5E7EB; }

      `}</style>
    </div>
  );
};
export default HomePage;