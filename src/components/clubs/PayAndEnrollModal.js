// Can be in the same ClubDetailPage.js file or imported
const PayAndEnrollModal = ({ isOpen, onClose, clubName, groundFees, coachingFees, onConfirmEnrollment }) => {
    if (!isOpen) return null;

    const totalFees = (groundFees?.amount || 0) + (coachingFees?.amount || 0);
    const currency = groundFees?.currency || coachingFees?.currency || 'USD';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Enroll in {clubName}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-3 text-sm text-slate-700 mb-6">
                    {groundFees?.amount > 0 && (
                        <div className="flex justify-between">
                            <span>Ground Fees:</span>
                            <span className="font-medium">{groundFees.amount} {groundFees.currency} {groundFees.notes && `(${groundFees.notes})`}</span>
                        </div>
                    )}
                    {coachingFees?.amount > 0 && (
                        <div className="flex justify-between">
                            <span>Coaching Fees:</span>
                            <span className="font-medium">{coachingFees.amount} {coachingFees.currency} {coachingFees.notes && `(${coachingFees.notes})`}</span>
                        </div>
                    )}
                    {totalFees > 0 && (
                        <div className="flex justify-between border-t pt-3 mt-3 font-semibold text-base">
                            <span>Total Payable:</span>
                            <span>{totalFees} {currency}</span>
                        </div>
                    )}
                    {totalFees === 0 && (
                         <p className="text-center text-green-600 font-medium">This club currently has no listed fees for enrollment!</p>
                    )}
                </div>

                <div className="text-xs text-slate-500 mb-6">
                    Note: Clicking "Pay & Enroll Now" will simulate the enrollment process. In a real application, this would integrate with a payment gateway.
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirmEnrollment} 
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
                    >
                        <CreditCardIcon className="w-4 h-4 mr-2"/> Pay & Enroll Now
                    </button>
                </div>
            </div>
        </div>
    );
};