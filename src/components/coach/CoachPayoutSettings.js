import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PayoutStatusBadge = ({ status }) => {
    const statusStyles = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800 animate-pulse', rejected: 'bg-red-100 text-red-800', needs_clarification: 'bg-orange-100 text-orange-800', not_started: 'bg-gray-100 text-gray-800', loading: 'bg-blue-100 text-blue-800' };
    const statusText = { active: 'Active', pending: 'Pending Verification', rejected: 'Rejected', needs_clarification: 'Action Required', not_started: 'Not Started', loading: 'Loading...' };
    const style = statusStyles[status] || statusStyles.not_started;
    const text = statusText[status] || 'Unknown';
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${style}`}>{text}</span>;
};

const CoachPayoutSettings = () => {
    const [status, setStatus] = useState('loading');
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState({ name: '', email: '', phone: '', pan: '', beneficiaryName: '', accountNumber: '', ifsc: '', address: { street1: '', street2: '', city: '', state: '', postal_code: '', country: 'IN' } });
    const [uiMode, setUiMode] = useState('view');

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/coaches/payout-status');
            setStatus(data.status);
        } catch (error) {
            toast.error('Could not load payout status.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const pollStatus = useCallback(async () => {
        try {
            const { data } = await api.get('/coaches/payout-status');
            if (data.status !== status) {
                fetchStatus();
            } else {
                setStatus(data.status);
            }
        } catch (error) { console.error("Polling for status failed:", error); }
    }, [status, fetchStatus]);

    useEffect(() => {
        let intervalId = null;
        if (status === 'pending' || status === 'created') {
            intervalId = setInterval(pollStatus, 20000);
        }
        return () => clearInterval(intervalId);
    }, [status, pollStatus]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const addressField = name.split('.')[1];
            setDetails(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
        } else {
            setDetails(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let endpoint;
        let method;
        let payload;

        if (status === 'active' && uiMode === 'updateBank') {
            endpoint = '/coaches/update-bank-details';
            method = 'put';
            payload = { accountNumber: details.accountNumber, ifsc: details.ifsc, beneficiaryName: details.beneficiaryName };
        } else if (status === 'active' && uiMode === 'reonboard') {
            endpoint = '/coaches/resubmit-full-details';
            method = 'put';
            payload = details;
        } else {
            endpoint = '/coaches/onboard-payouts';
            method = 'post';
            payload = details;
        }

        try {
            const { data } = await api[method](endpoint, payload);
            toast.success(data.message || "Details submitted successfully.");
            setUiMode('view');
            fetchStatus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit details.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

    const renderForm = (mode) => {
        const isUpdateBankOnly = mode === 'updateBank';
        return (
            <form onSubmit={handleSubmit} className="space-y-6 mt-4 border-t border-slate-200 pt-6">
                <section>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Personal & KYC Details</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                        <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name<span className="text-red-500 ml-1">*</span></label><input type="text" name="name" value={details.name} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN Number<span className="text-red-500 ml-1">*</span></label><input type="text" name="pan" value={details.pan} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email<span className="text-red-500 ml-1">*</span></label><input type="email" name="email" value={details.email} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone<span className="text-red-500 ml-1">*</span></label><input type="tel" name="phone" value={details.phone} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                    </div>
                </section>
                <section>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Registered Address</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-4">
                        <div><label htmlFor="address.street1" className="block text-sm font-medium text-gray-700">Street Address Line 1<span className="text-red-500 ml-1">*</span></label><input type="text" name="address.street1" value={details.address.street1} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="address.street2" className="block text-sm font-medium text-gray-700">Street Address Line 2<span className="text-red-500 ml-1">*</span></label><input type="text" name="address.street2" value={details.address.street2} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
                        <div><label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City<span className="text-red-500 ml-1">*</span></label><input type="text" name="address.city" value={details.address.city} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State<span className="text-red-500 ml-1">*</span></label><input type="text" name="address.state" value={details.address.state} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                        <div><label htmlFor="address.postal_code" className="block text-sm font-medium text-gray-700">Postal Code<span className="text-red-500 ml-1">*</span></label><input type="text" name="address.postal_code" value={details.address.postal_code} onChange={handleInputChange} required className={inputStyle} disabled={isUpdateBankOnly}/></div>
                    </div>
                </section>
                <section>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Details</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                        <div><label htmlFor="beneficiaryName" className="block text-sm font-medium text-gray-700">Account Holder Name<span className="text-red-500 ml-1">*</span></label><input type="text" name="beneficiaryName" value={details.beneficiaryName} onChange={handleInputChange} required className={inputStyle}/></div>
                        <div><label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number<span className="text-red-500 ml-1">*</span></label><input type="text" name="accountNumber" value={details.accountNumber} onChange={handleInputChange} required className={inputStyle}/></div>
                        <div><label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">IFSC Code<span className="text-red-500 ml-1">*</span></label><input type="text" name="ifsc" value={details.ifsc} onChange={handleInputChange} required className={inputStyle}/></div>
                    </div>
                </section>
                <div className="pt-5 flex items-center gap-4">
                    <button type="submit" disabled={loading} className="w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Submitting...' : 'Submit Details'}
                    </button>
                    {(uiMode === 'updateBank' || uiMode === 'reonboard') && <button type="button" onClick={() => setUiMode('view')} className="text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>}
                </div>
            </form>
        );
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <p className="text-gray-500 text-center py-8">Loading...</p>;
            case 'active':
                return (
                    <div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="font-semibold text-green-800">Your payout account is active.</p>
                        </div>
                        {uiMode === 'view' && (
                            <div className="mt-6 space-y-4">
                                <p className="text-slate-600">If your details have changed, you can update your information below.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => setUiMode('updateBank')} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">Update Bank Details Only</button>
                                    <button onClick={() => setUiMode('reonboard')} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">Re-submit All KYC Details</button>
                                </div>
                            </div>
                        )}
                        {uiMode === 'updateBank' && renderForm('updateBank')}
                        {uiMode === 'reonboard' && renderForm('reonboard')}
                    </div>
                );
            case 'pending':
            case 'created':
                 return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md"><p className="font-semibold text-yellow-800">Your account is under verification.</p><p className="text-yellow-700 mt-1">This page will update automatically.</p></div>;
            case 'needs_clarification':
                return (
                    <>
                        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-md text-sm">
                            <p className="font-semibold">Action Required: Your details need correction.</p>
                            <p className="mt-1">Razorpay has flagged an issue (e.g., name mismatch between PAN and bank account). Please check your email for details from Razorpay, carefully correct the information below, and re-submit.</p>
                        </div>
                        {renderForm('initial')}
                    </>
                );
            case 'rejected':
                return (
                    <>
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            <p className="font-semibold">Your previous submission was rejected.</p>
                            <p className="mt-1">Please review your details below and submit again.</p>
                        </div>
                        {renderForm('initial')}
                    </>
                );
            case 'not_started':
                return renderForm('initial');
            default:
                 return <p className="text-red-500 text-center py-8">An unexpected error occurred.</p>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto my-12">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">My Payout Settings</h2>
                <PayoutStatusBadge status={status} />
            </div>
            {renderContent()}
        </div>
    );
};

export default CoachPayoutSettings;