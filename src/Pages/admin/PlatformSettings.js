import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; // Your axios instance
import { toast } from 'react-toastify';

// --- Helper Components (No changes needed, they are well-written) ---

const PayoutStatusBadge = ({ status }) => {
    const statusMap = {
        not_started: { text: "Not Started", color: "bg-gray-100 text-gray-800" },
        pending: { text: "Pending Verification", color: "bg-yellow-100 text-yellow-800 animate-pulse" },
        active: { text: "Active & Verified", color: "bg-green-100 text-green-800" },
        needs_clarification: { text: "Action Required", color: "bg-orange-100 text-orange-800" },
        rejected: { text: "Rejected", color: "bg-red-100 text-red-800" }
    };
    const { text, color } = statusMap[status] || statusMap.not_started;
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>{text}</span>;
};

const StatusAlert = ({ status }) => {
    switch (status) {
        case 'active':
            return <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md text-green-800">Your account is active and can receive platform fees.</div>;
        case 'pending':
            return <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">Your previous submission is pending verification. You can update and resubmit if needed.</div>;
        case 'rejected':
            return <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"><p className="font-semibold">Your previous submission was rejected.</p><p>Please review your details carefully and submit again.</p></div>;
        default:
            return <p className="text-sm text-gray-600 mb-4">Enter the required details to set up the platform's payout account.</p>;
    }
};

// --- Main Component ---

const PlatformSettings = () => {
    // State for both forms
    const [fee, setFee] = useState('');
    const [payoutStatus, setPayoutStatus] = useState('not_started');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [details, setDetails] = useState({
        name: '', email: '', phone: '', pan: '', beneficiaryName: '',
        accountNumber: '', ifsc: '',
        address: { street1: '', street2: '', city: '', state: '', postal_code: '', country: 'IN' }
    });

    const fetchSettings = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/settings');
            setFee(data.settings?.platformFee?.amount || '');
            setPayoutStatus(data.razorpayStatus || 'not_started');
        } catch (error) {
            toast.error("Could not load platform settings.");
        } finally {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const addressField = name.split('.')[1];
            setDetails(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        if (!details.pan) return toast.error("PAN Number is a required field.");
        if (!/^\d{10}$/.test(details.phone)) return toast.error("Please enter a valid 10-digit phone number.");
        
        setLoading(true);
        try {
            const { data } = await api.post('/admin/onboard-platform', details);
            toast.success(data.message);
            
            // --- OPTIMIZATION: Update the UI state instantly ---
            // Instead of making another API call, we know the status is now 'pending'.
            // This provides immediate feedback to the user.
            setPayoutStatus('pending'); 

        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleFeeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/update-fee', { amount: Number(fee) });
            toast.success("Platform fee updated!");
        } catch (error) {
            toast.error("Failed to update fee.");
        } finally {
            setLoading(false);
        }
    };
    
    // --- Consistent input styling ---
    const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
    
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Settings</h1>
            
            {/* Payout Account Setup Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Platform Payout Account</h2>
                    <PayoutStatusBadge status={payoutStatus} />
                </div>
                {initialLoading ? (
                    <div className="flex justify-center items-center h-40"><p className="text-gray-500">Loading payout settings...</p></div>
                ) : (
                    <div className="mt-4">
                        <StatusAlert status={payoutStatus} />
                        <form onSubmit={handleBankSubmit} className="space-y-6">
                            
                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Personal & KYC Details</h3>
                                <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                                    <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name (as per PAN)</label><input type="text" name="name" id="name" value={details.name} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN Number</label><input type="text" name="pan" id="pan" value={details.pan} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" name="email" id="email" value={details.email} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Phone Number</label><input type="tel" name="phone" id="phone" value={details.phone} onChange={handleInputChange} required placeholder="10-digit mobile number" className={inputStyle} /></div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Registered Address</h3>
                                <div className="grid grid-cols-1 gap-y-4 mt-4">
                                    <div><label htmlFor="address.street1" className="block text-sm font-medium text-gray-700">Street Address Line 1</label><input type="text" name="address.street1" id="address.street1" value={details.address.street1} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="address.street2" className="block text-sm font-medium text-gray-700">Street Address Line 2 (Optional)</label><input type="text" name="address.street2" id="address.street2" value={details.address.street2} onChange={handleInputChange} className={inputStyle}/></div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
                                    <div><label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City</label><input type="text" name="address.city" id="address.city" value={details.address.city} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State</label><input type="text" name="address.state" id="address.state" value={details.address.state} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="address.postal_code" className="block text-sm font-medium text-gray-700">Postal Code</label><input type="text" name="address.postal_code" id="address.postal_code" value={details.address.postal_code} onChange={handleInputChange} required className={inputStyle}/></div>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Details</h3>
                                <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                                    <div><label htmlFor="beneficiaryName" className="block text-sm font-medium text-gray-700">Bank Account Holder Name</label><input type="text" name="beneficiaryName" id="beneficiaryName" value={details.beneficiaryName} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Bank Account Number</label><input type="text" name="accountNumber" id="accountNumber" value={details.accountNumber} onChange={handleInputChange} required className={inputStyle}/></div>
                                    <div><label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">IFSC Code</label><input type="text" name="ifsc" id="ifsc" value={details.ifsc} onChange={handleInputChange} required className={inputStyle}/></div>
                                </div>
                            </section>
                            
                            <div className="pt-5 border-t border-gray-200">
                                <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? "Submitting..." : "Save & Submit to Razorpay"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Platform Fee Setup Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Fee Per Enrollment</h2>
                <form onSubmit={handleFeeSubmit} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">₹</span>
                        <input type="number" value={fee} min="0" onChange={e => setFee(e.target.value)} required className={`pl-7 ${inputStyle}`} placeholder="e.g., 500" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Saving..." : "Save Fee"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PlatformSettings;