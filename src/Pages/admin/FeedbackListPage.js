import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Spinner from '../../components/common/Spinner';

const Pagination = ({ page, pages, onPageChange }) => {
    if (pages <= 1) return null;
    return (
        <div className="flex justify-center items-center mt-8">
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="flex items-center px-4 py-2 mx-1 text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiChevronLeft className="w-5 h-5" /> <span className="ml-2">Prev</span>
            </button>
            <span className="px-4 py-2 text-gray-700 font-medium">Page {page} of {pages}</span>
            <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="flex items-center px-4 py-2 mx-1 text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="mr-2">Next</span> <FiChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

const FeedbackListPage = () => {
    const [sortBy, setSortBy] = useState('-createdAt');
    const [filterByReason, setFilterByReason] = useState('');
    const [filterByRole, setFilterByRole] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, count: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', 10);
            params.append('sort', sortBy);
            
            // This logic is crucial: only add the filter if it has a value.
            if (filterByReason) {
                params.append('reason', filterByReason);
            }
            if (filterByRole) {
                params.append('role', filterByRole);
            }

            try {
                const { data } = await api.get(`/feedback?${params.toString()}`);
                
                if (data && data.success && data.data && data.pagination) {
                    setFeedbacks(data.data);
                    setPagination(data.pagination);
                } else {
                    throw new Error('Received an invalid response from the server.');
                }
            } catch (err) {
                setError('Failed to fetch feedback submissions. Please check the console.');
                console.error("API Error or Invalid Data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [currentPage, sortBy, filterByReason, filterByRole]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSortBy('-createdAt');
        setFilterByReason('');
        setFilterByRole('');
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.pages) {
            setCurrentPage(newPage);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spinner size="12" /></div>;
    if (error) return <div className="p-8"><div className="text-center p-8 text-red-700 bg-red-100 rounded-lg shadow-md"><h3 className="font-bold text-lg">An Error Occurred</h3><p>{error}</p></div></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Feedback Submissions</h1>
                <p className="text-sm text-gray-500 mb-6">Total found: {pagination.count}</p>

                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Sort By Filter */}
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort By</label>
                            <select id="sort" name="sort" value={sortBy} onChange={handleFilterChange(setSortBy)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="-createdAt">Newest to Oldest</option>
                                <option value="createdAt">Oldest to Newest</option>
                            </select>
                        </div>
                        {/* Filter by Reason */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                            <select id="reason" name="reason" value={filterByReason} onChange={handleFilterChange(setFilterByReason)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="">All Reasons</option>
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Data Correction">Data Correction</option>
                                <option value="Feature Suggestion">Feature Suggestion</option>
                            </select>
                        </div>
                        {/* Filter by Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <select id="role" name="role" value={filterByRole} onChange={handleFilterChange(setFilterByRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="">All Roles</option>
                                <option value="Coach">Coach</option>
                                <option value="Player">Player</option>
                                <option value="Parent">Parent</option>
                                <option value="Team Manager">Team Manager</option>
                                <option value="Admin">Admin</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {/* Reset Button */}
                        <div>
                            <button onClick={resetFilters} className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-lg shadow">
                        <FiInbox className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Results Found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or resetting them.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitter Info</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {feedbacks.map((feedback) => (
                                            <tr key={feedback._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                                                    <div className="text-sm text-gray-500">{feedback.role}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{feedback.reason}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate hover:whitespace-normal cursor-pointer">{feedback.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackListPage;