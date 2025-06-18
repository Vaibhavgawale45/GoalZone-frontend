// client/src/Pages/admin/AdminManageClubsExtendedPage.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import { Link } from "react-router-dom";

// --- Placeholder Icons ---
const EyeIcon = ({ className = "w-4 h-4 inline-block" }) => <span className={className} role="img" aria-label="view">👁️</span>;
const CheckCircleIcon = ({ className = "w-4 h-4 inline-block" }) => <span className={className} role="img" aria-label="approve/activate">✔️</span>;
const XCircleIcon = ({ className = "w-4 h-4 inline-block" }) => <span className={className} role="img" aria-label="reject/suspend">❌</span>;
const TrashIcon = ({ className = "w-4 h-4 inline-block" }) => <span className={className} role="img" aria-label="delete">🗑️</span>;
// --- End Placeholder Icons ---

// --- Loading Spinner Component ---
const LoadingSpinner = ({ small = false }) => (
  <div role="status" className="inline-block">
    <svg aria-hidden="true" className={`${small ? "w-6 h-6" : "w-8 h-8"} text-slate-200 animate-spin fill-sky-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
    <span className="sr-only">Loading...</span>
  </div>
);
// --- End Loading Spinner Component ---

// --- Pagination Component (assuming it's correct from your last provided code) ---
const Pagination = ({ currentPage, totalPages, onPageChange, forSection }) => {
  if (totalPages <= 1) return null;
  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages && totalPages > maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
  }
  return (
    <nav aria-label={`Page navigation for ${forSection}`} className="flex justify-center p-4 mt-4">
        <ul className="inline-flex items-center -space-x-px text-sm">
            <li><button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="px-3 h-8 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">First</button></li>
            <li><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 h-8 leading-tight text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button></li>
            {pageNumbers.map(number => (
                <li key={number}><button onClick={() => onPageChange(number)} className={`px-3 h-8 leading-tight border border-slate-300 ${currentPage === number ? 'text-sky-600 bg-sky-50 border-sky-300 hover:bg-sky-100 hover:text-sky-700 z-10' : 'text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700'}`}>{number}</button></li>
            ))}
            <li><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 h-8 leading-tight text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Next</button></li>
            <li><button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 h-8 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Last</button></li>
        </ul>
    </nav>
  );
};
// --- End Pagination Component ---

const AdminManageClubsExtendedPage = () => {
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [clubs, setClubs] = useState([]); // Holds the clubs currently displayed (can be paginated client-side)
  // const [allFetchedClubs, setAllFetchedClubs] = useState([]); // If doing client-side filtering from a master list

  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState("");
  const [clubSearchTerm, setClubSearchTerm] = useState("");
  const [toast, setToast] = useState({ message: '', type: '', visible: false });


  const [paginationClubs, setPaginationClubs] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    limit: 10,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
  };

  const fetchPendingCoaches = useCallback(async () => {
    setLoadingCoaches(true);
    try {
      const response = await api.get("/admin/coaches/pending");
      if (response.data && Array.isArray(response.data)) {
        setPendingCoaches(response.data);
      } else {
        setPendingCoaches([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending coaches.");
      setPendingCoaches([]);
    } finally {
      setLoadingCoaches(false);
    }
  }, []);

  // Using your fetchClubs from the last provided code that does client-side pagination
  const fetchClubs = useCallback(
    async (page = 1, searchTerm = "") => {
      setLoadingClubs(true);
      setError(""); // Clear previous club errors
      try {
        const params = {}; // No params needed if backend sends all clubs
        
        console.log("[fetchClubs] Requesting ALL clubs from /api/admin/clubs");
        const response = await api.get("/admin/clubs", { params }); // Fetches all clubs
        console.log("[fetchClubs] Response data from /api/admin/clubs:", response.data);

        if (response.data && Array.isArray(response.data)) {
          let fullClubList = response.data;

          // Client-side Search
          if (searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.trim().toLowerCase();
            fullClubList = fullClubList.filter(
              (club) =>
                club.name.toLowerCase().includes(lowerSearchTerm) ||
                (club.coach && club.coach.name.toLowerCase().includes(lowerSearchTerm))
            );
          }

          // Client-side Pagination
          const limit = paginationClubs.limit;
          const totalDocs = fullClubList.length;
          const totalPages = Math.ceil(totalDocs / limit) || 1;
          
          // Ensure current page is valid after search
          const effectivePage = Math.min(page, totalPages) || 1;

          const startIndex = (effectivePage - 1) * limit;
          const endIndex = effectivePage * limit;
          const paginatedClubs = fullClubList.slice(startIndex, endIndex);

          setClubs(paginatedClubs); // Set the clubs to be displayed for the current page
          setPaginationClubs((prev) => ({
            ...prev,
            currentPage: effectivePage,
            totalPages: totalPages,
            totalDocs: totalDocs,
          }));
        } else {
          console.warn("[fetchClubs] Unexpected response structure. Expected direct array. Data:", response.data);
          setClubs([]);
          setPaginationClubs((prev) => ({ ...prev, currentPage: 1, totalPages: 1, totalDocs: 0 }));
        }
      } catch (err) {
        console.error("[fetchClubs] Error fetching clubs:", err.response || err);
        setError(err.response?.data?.message || "Failed to fetch clubs.");
        setClubs([]);
        setPaginationClubs((prev) => ({ ...prev, currentPage: 1, totalPages: 1, totalDocs: 0 }));
      } finally {
        setLoadingClubs(false);
      }
    },
    [paginationClubs.limit] // Limit is a dependency for client-side pagination calculation
  );

  useEffect(() => {
    fetchPendingCoaches();
  }, [fetchPendingCoaches]);

  useEffect(() => {
    fetchClubs(paginationClubs.currentPage, clubSearchTerm);
  }, [paginationClubs.currentPage, clubSearchTerm, fetchClubs]);


  const handleCoachApproval = async (coachId, action) => {
    try {
      await api.put(`/admin/coaches/${coachId}/${action}`);
      showToast(`Coach ${action === "approve" ? "approved" : "rejected"} successfully.`);
      fetchPendingCoaches();
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${action} coach.`;
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  // --- THIS IS THE FUNCTION FOR SUSPEND/ACTIVATE ---
  const handleClubStatusToggle = async (clubId, currentClubStatus) => {
    // IMPORTANT: This function ASSUMES 'currentClubStatus' is correctly passed
    // and that your club objects HAVE a 'status' field (e.g., 'active' or 'suspended')
    // If club.status is undefined, this logic won't work as expected.

    const isCurrentlySuspended = currentClubStatus === 'suspended';
    const newStatus = isCurrentlySuspended ? 'active' : 'suspended';
    const actionVerb = isCurrentlySuspended ? 'activate' : 'suspend';

    console.log(`[handleClubStatusToggle] Club ID: ${clubId}, Current Status: ${currentClubStatus}, New Status: ${newStatus}`);

    if (currentClubStatus === undefined) {
        showToast("Club status is unknown. Cannot perform action. Please ensure backend provides club status.", "error");
        console.error("Club status is undefined for clubId:", clubId);
        return;
    }

    try {
      // Backend call to update club status
      // Your backend PUT /api/admin/clubs/:id controller needs to handle { status: newStatus }
      await api.put(`/admin/clubs/${clubId}`, { status: newStatus });
      showToast(`Club ${actionVerb}d successfully.`);
      // Refresh the clubs list to reflect the change
      fetchClubs(paginationClubs.currentPage, clubSearchTerm);
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${actionVerb} club.`;
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };
  // --- END OF SUSPEND/ACTIVATE FUNCTION ---

  const handleDeleteClub = async (clubId, clubName) => {
    if (window.confirm(`Are you sure you want to permanently delete club "${clubName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/clubs/${clubId}`);
        showToast(`Club "${clubName}" deleted successfully.`);
        fetchClubs(paginationClubs.currentPage, clubSearchTerm);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to delete club.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    }
  };

  // --- Styling Constants ---
  const btnBase = "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed";
  const btnPrimarySm = `${btnBase} text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500`;
  const btnSuccessOutlineSm = `${btnBase} text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-400 focus:ring-emerald-500`;
  const btnWarningOutlineSm = `${btnBase} text-amber-600 bg-white hover:bg-amber-50 border border-amber-400 focus:ring-amber-500`;
  const btnDangerOutlineSm = `${btnBase} text-red-600 bg-white hover:bg-red-50 border border-red-400 focus:ring-red-500`;
  const inputStyle = "w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm placeholder-slate-400 transition-colors";
  // --- End Styling Constants ---

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {toast.visible && (
          <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} z-50`}>
              {toast.message}
          </div>
      )}

      <header className="pb-5 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Coach & Club Management</h1>
          <p className="text-sm text-slate-500 mt-1">Approve coach registrations and manage existing clubs.</p>
      </header>

      {error && (
        <div className="p-4 my-4 bg-red-100 text-red-700 rounded-md border border-red-300 shadow-sm text-sm whitespace-pre-line">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Section for Pending Coach Approvals (Assuming this section is mostly fine) */}
      <section className="bg-white shadow-xl rounded-lg border border-slate-200">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700">Pending Coach Approvals ({pendingCoaches.length})</h2>
          </div>
          <div className="p-4 sm:p-6">
          {loadingCoaches ? <div className="text-center py-8"><LoadingSpinner /> <p className="mt-2 text-slate-500">Loading pending coaches...</p></div> :
              pendingCoaches.length === 0 ? <p className="text-slate-500 text-center py-6">No coaches are currently awaiting approval.</p> : (
                  <div className="overflow-x-auto">
                      {/* ... Coach table ... */}
                      <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                              <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Coach Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Club Intent</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                              {pendingCoaches.map(coach => (
                                  <tr key={coach._id} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{coach.name}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{coach.email}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{coach.clubNameRegistered || <span className="italic text-slate-400">N/A</span>}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center text-xs font-medium">
                                          <div className="flex items-center justify-center space-x-1.5">
                                              <button onClick={() => handleCoachApproval(coach._id, 'approve')} className={`${btnSuccessOutlineSm}`} title="Approve Coach">
                                                  <CheckCircleIcon /> Approve
                                              </button>
                                              <button onClick={() => handleCoachApproval(coach._id, 'reject')} className={`${btnWarningOutlineSm}`} title="Reject Coach">
                                                  <XCircleIcon /> Reject
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </section>

      {/* Section for Existing Clubs Management */}
      <section className="bg-white shadow-xl rounded-lg border border-slate-200">
          <div className="p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-700">Manage Existing Clubs ({paginationClubs.totalDocs})</h2>
          </div>
          <div className="p-4 sm:p-6">
              <div className="mb-4">
                  <input
                      type="text"
                      placeholder="Search clubs by name or coach..."
                      value={clubSearchTerm}
                      onChange={(e) => {
                        setClubSearchTerm(e.target.value);
                        setPaginationClubs(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
                      }}
                      className={inputStyle}
                  />
              </div>
              {loadingClubs && clubs.length === 0 ? ( // Show loader if loading and no clubs yet displayed
                <div className="text-center py-8"><LoadingSpinner /> <p className="mt-2 text-slate-500">Loading clubs...</p></div>
              ) : clubs.length === 0 ? ( // No clubs after loading (either no data or search found nothing)
                <p className="text-slate-500 text-center py-6">
                  No clubs found{clubSearchTerm ? ` for your search "${clubSearchTerm}"` : ''}.
                  {paginationClubs.totalDocs > 0 && clubSearchTerm && " Try a different search term."}
                  {paginationClubs.totalDocs === 0 && !clubSearchTerm && " There are no clubs to display."}
                </p>
              ) : (
                  <>
                      <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Club Name</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Coach</th>
                                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-slate-200">
                                  {clubs.map((club) => (
                                      <tr key={club._id} className={`hover:bg-slate-50/70 transition-colors ${club.status === "suspended" ? "opacity-70 bg-red-50 hover:bg-red-100/70" : ""}`}>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{club.name}</td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{club.coach?.name || <span className="italic text-slate-400">N/A</span>}</td>
                                          <td className="px-4 py-3 whitespace-nowrap text-center">
                                              <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
                                                  ${club.status === "active" ? "bg-green-100 text-green-800 border border-green-300"
                                                    : club.status === "suspended" ? "bg-red-100 text-red-800 border border-red-300"
                                                    : "bg-slate-100 text-slate-800 border border-slate-300"}`}>
                                                  {/* CRITICAL: This relies on club.status existing! */}
                                                  {club.status ? club.status.charAt(0).toUpperCase() + club.status.slice(1) : "Unknown"}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-center text-xs font-medium">
                                              <div className="flex items-center justify-center space-x-1.5">
                                                  <Link to={`/club/${club._id}`} className={`${btnPrimarySm}`} title="View Club Details">
                                                      <EyeIcon /> View
                                                  </Link>
                                                  {/* CRITICAL: These buttons depend on club.status existing and having correct values */}
                                                  {club.status === "active" && (
                                                      <button onClick={() => handleClubStatusToggle(club._id, club.status)} className={`${btnWarningOutlineSm}`} title="Suspend Club">
                                                          <XCircleIcon /> Suspend
                                                      </button>
                                                  )}
                                                  {club.status === "suspended" && (
                                                      <button onClick={() => handleClubStatusToggle(club._id, club.status)} className={`${btnSuccessOutlineSm}`} title="Activate Club">
                                                          <CheckCircleIcon /> Activate
                                                      </button>
                                                  )}
                                                  <button onClick={() => handleDeleteClub(club._id, club.name)} className={`${btnDangerOutlineSm}`} title="Delete Club">
                                                      <TrashIcon /> Delete
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                      <Pagination
                          currentPage={paginationClubs.currentPage}
                          totalPages={paginationClubs.totalPages}
                          onPageChange={(page) => setPaginationClubs((p) => ({ ...p, currentPage: page }))}
                          forSection="clubs"
                      />
                  </>
              )}
          </div>
      </section>
    </div>
  );
};

export default AdminManageClubsExtendedPage;