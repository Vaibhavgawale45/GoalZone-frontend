import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
} from "react-share";
import api from "../services/api.js";
import ClubPageSidebar from "../components/layouts/ClubPageSidebar.js";
import EditClubModal from "../components/clubs/EditClubModal.js";
import { useAuth } from "../contexts/AuthContext.js";
import { toast } from "react-toastify";
import Leaderboard from "../components/clubs/Leaderboard.js";

// --- All Icon components and other boilerplate components remain the same ---
const ChevronLeftIcon = ({ className = "w-5 h-5 sm:w-6 sm:h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = ({ className = "w-5 h-5 sm:w-6 sm:h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const InstagramIcon = ({ className = "w-5 h-5 inline-block mr-1.5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/></svg>;
const YouTubeIcon = ({ className = "w-5 h-5 inline-block mr-1.5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
const LocationPinIcon = ({ className = "w-4 h-4 inline-block mr-1.5 text-slate-500" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.27.615-.454l.645-.56.645-.56a7.252 7.252 0 001.94-2.045l.003-.005.009-.019a5.745 5.745 0 00.28-1.592l.001-.004c.045-.202.068-.415.068-.628a5.741 5.741 0 00-11.482 0c0 .213.023.426.068.628l.001.004.009.019a5.745 5.745 0 00.28 1.592l.003.005a7.252 7.252 0 001.94 2.045l.645.56.645.56.615.454c.215.184.43.354.615.454a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>;
const CashIcon = ({ className = "w-4 h-4 inline-block mr-1.5 text-green-600" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10.75 10.837a1 1 0 00-1.5 0 1 1 0 000 1.525l1.835 1.951a1.5 1.5 0 002.165 0l3.3-3.52a1 1 0 00-1.525-1.4l-2.48 2.653-1.095-1.162z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v6.5a.75.75 0 001.5 0v-6.5z" clipRule="evenodd" /></svg>;
const ShareIcon = ({ className = "w-4 h-4 inline-block mr-1.5 text-slate-500" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M15.836 4.164a2.5 2.5 0 00-3.536 0L8.664 7.799a2.5 2.5 0 100 4.402l3.638 3.638a2.5 2.5 0 103.536-3.536L12.201 8.664a2.5 2.5 0 000-4.402l3.636-3.638zM6.5 11a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5-6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3.5 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>;
const CreditCardIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M2.5 4.5a3 3 0 00-3 3v6a3 3 0 003 3h15a3 3 0 003-3v-6a3 3 0 00-3-3h-15z" /><path d="M20 7H0v-.5A2.5 2.5 0 012.5 4h15A2.5 2.5 0 0120 6.5V7zM6 14a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
const CloseIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>;
const LoadingSpinner = ({text = "Loading..."}) => <div role="status" className="text-center p-4"><p className="text-slate-600 animate-pulse">{text}</p></div>;
const ErrorStateDisplay = ({ message, onRetry }) => ( <div className="min-h-[30vh] flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg text-center"><span className="text-4xl mb-4">⚠️</span><p className="text-xl font-semibold text-red-700 mb-2">Oops! Something Went Wrong</p><p className="text-slate-600 mb-6 max-w-md">{message}</p>{onRetry && <button onClick={onRetry} className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Try Again</button>}</div> );
const NotFoundDisplay = ({ itemType = "Club" }) => ( <div className="min-h-[30vh] flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg text-center"><span className="text-4xl mb-4">❓</span><p className="text-xl font-semibold text-slate-700 mb-2">{itemType} Not Found</p><p className="text-slate-500 mb-6">We couldn't find the {itemType.toLowerCase()} you're looking for.</p><Link to="/" className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Browse Clubs</Link></div> );
const currency = 'INR';


const PayAndEnrollModal = ({ isOpen, onClose, club, platformFee, onConfirmEnrollment, processingEnrollment }) => {
    if (!isOpen || !club) return null;

    const clubFee = (club.groundFees?.amount || 0) + (club.coachingFees?.amount || 0);
    const platformFeeWithGst = platformFee + Math.round(platformFee * 0.18);
    const totalFees = clubFee + platformFeeWithGst;
    const currency = 'INR';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Online Payment for {club.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><CloseIcon /></button>
                </div>

                <div className="space-y-3 text-sm text-slate-700 mb-6">
                    {clubFee > 0 && 
                        <div className="flex justify-between">
                            <span>Club Fees:</span>
                            <span className="font-medium">{clubFee.toLocaleString()} {currency}</span>
                        </div>
                    }
                    {platformFee > 0 && 
                        <div className="flex justify-between">
                            <span>Platform Fee (incl. taxes):</span>
                            <span className="font-medium">{platformFeeWithGst.toLocaleString()} {currency}</span>
                        </div>
                    }
                    <div className="flex justify-between border-t pt-3 mt-3 font-semibold text-base">
                        <span>Total Payable:</span>
                        <span>{totalFees.toLocaleString()} {currency}</span>
                    </div>
                    {totalFees === 0 && 
                        <p className="text-center text-green-600 font-medium py-2">This is a free enrollment!</p>
                    }
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={processingEnrollment} 
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirmEnrollment} 
                        disabled={processingEnrollment} 
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center disabled:bg-sky-400 disabled:cursor-not-allowed"
                    >
                         {processingEnrollment ? (
                            <>
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                <span>Processing...</span>
                            </>
                         ) : (
                            <>
                                <CreditCardIcon className="w-4 h-4 mr-2"/>
                                Pay & Enroll
                            </>
                         )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChoosePaymentMethodModal = ({ isOpen, onClose, onOnline, onOffline, processing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Choose Enrollment Method</h2>
                <p className="text-sm text-slate-600 mb-6">You can pay securely online or request to pay the coach directly in cash.</p>
                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={onOnline} 
                        disabled={processing} 
                        className="w-full flex justify-center items-center py-2.5 px-4 text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400"
                    >
                        Pay Online
                    </button>
                    <button 
                        onClick={onOffline} 
                        disabled={processing} 
                        className="w-full flex justify-center items-center py-2.5 px-4 text-base font-medium rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300"
                    >
                        {processing ? 'Processing...' : 'Request Offline Payment'}
                    </button>
                </div>
                <button 
                    onClick={onClose} 
                    disabled={processing} 
                    className="mt-6 text-sm text-slate-500 hover:text-slate-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

const ClubDetailPage = () => {
    // --- All state, hooks, and functions remain the same up to the shareDetails hook ---
    const { clubId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserEnrollment, setCurrentUserEnrollment] = useState(null);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isChooseMethodModalOpen, setIsChooseMethodModalOpen] = useState(false);
    const [processingEnrollment, setProcessingEnrollment] = useState(false);
    const [platformFee, setPlatformFee] = useState(0);
    const [currentCarouselImageIndex, setCurrentCarouselImageIndex] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const carouselIntervalRef = useRef(null);
    
    // --- All fetch logic, handlers, etc. are unchanged ---
    // ... fetchPageData, handleClubUpdated, nextImage, prevImage, etc.
    const fetchPageData = useCallback(async () => {
        setLoading(true);
        setError("");
        setCurrentUserEnrollment(null);
        
        try {
            const [clubResponse, settingsResponse, myEnrollmentsResponse] = await Promise.all([
                api.get(`/clubs/${clubId}`),
                api.get('/admin/platform-fee'),
                user ? api.get('/enrollments/my-enrollments') : Promise.resolve({ data: [] })
            ]);

            const fetchedClubData = clubResponse.data;
            if (!fetchedClubData) {
                setError("Club data could not be loaded.");
                setClub(null);
                setLoading(false);
                return;
            }
            setClub(fetchedClubData);
            setPlatformFee(settingsResponse.data.platformFee || 0);

            if (myEnrollmentsResponse.data) {
                const enrollmentsForThisClub = myEnrollmentsResponse.data.filter(
                    (enrollment) => enrollment.club?._id === fetchedClubData._id
                );
                const mostRecentEnrollment = enrollmentsForThisClub[0] || null;
                setCurrentUserEnrollment(mostRecentEnrollment);
            }
            
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setClub(null); setError("");
            } else {
                setError(err.response?.data?.message || "Failed to fetch page data.");
            }
        } finally {
            setLoading(false);
        }
    }, [clubId, user]);

    useEffect(() => { 
        if (clubId && !authLoading) fetchPageData();
    }, [clubId, authLoading, fetchPageData]);

    const handleClubUpdated = (updatedClubData) => {
        setClub(updatedClubData);
        toast.success("Club details updated successfully!");
    };

    const carouselItems = useMemo(() => club?.carouselImages || [], [club]);

    const nextImage = useCallback(() => {
        if (carouselItems.length > 1) setCurrentCarouselImageIndex((prev) => (prev + 1) % carouselItems.length);
    }, [carouselItems]);

    const prevImage = () => {
        if (carouselItems.length > 1) setCurrentCarouselImageIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    };

    useEffect(() => {
        if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
        if (carouselItems.length > 1) carouselIntervalRef.current = setInterval(nextImage, 4000);
        return () => { if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current) };
    }, [carouselItems, nextImage]);

    const handleOpenEnrollFlow = () => {
        if (!user) {
            toast.info("Please log in to enroll.");
            navigate("/login", { state: { from: location } });
            return;
        }
        if (user.role !== "Player") {
            toast.warn("Only players can enroll in clubs.");
            return;
        }
        setIsChooseMethodModalOpen(true);
    };

    const handleOnlinePayment = () => {
        setIsChooseMethodModalOpen(false);
        setIsPayModalOpen(true);
    };

    const handleRequestOffline = async () => {
        setProcessingEnrollment(true);
        try {
            const res = await api.post('/enrollments/request-offline', { clubId: club._id });
            toast.success(res.data.message);
            await fetchPageData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request.');
        } finally {
            setIsChooseMethodModalOpen(false);
            setProcessingEnrollment(false);
        }
    };

    const handleConfirmOnlinePayment = async () => {
        setProcessingEnrollment(true);
        try {
            const { data: orderResponse } = await api.post("/enrollments/create-order", { clubId: club._id });
            
            if (orderResponse.isFreeEnrollment) {
                toast.success(orderResponse.message);
                setIsPayModalOpen(false);
                await fetchPageData();
                setProcessingEnrollment(false);
                return;
            }

            const { orderId, amount, currency, razorpayKeyId } = orderResponse;
            const options = {
                key: razorpayKeyId,
                amount,
                currency,
                name: "Goal Zone",
                description: `Enrollment for ${club.name}`,
                image: club.logoUrl || '',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            clubId: club._id,
                        };
                        const { data: verifyResponse } = await api.post("/enrollments/verify-payment", verificationData);
                        if (verifyResponse.success) {
                            toast.success(verifyResponse.message || `Successfully enrolled in ${club.name}!`);
                            await fetchPageData();
                        } else {
                            toast.error(verifyResponse.message || "Payment verification failed.");
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.message || "An error occurred during payment verification.");
                    } finally {
                        setIsPayModalOpen(false);
                        setProcessingEnrollment(false);
                    }
                },
                prefill: { name: user.name, email: user.email, contact: user.phone || '' },
                theme: { color: "#0EA5E9" },
                modal: { ondismiss: () => setProcessingEnrollment(false) }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', (response) => {
                toast.error(`Payment Failed: ${response.error.description}`);
                setProcessingEnrollment(false);
            });
            razorpay.open();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not initiate payment.");
            setProcessingEnrollment(false);
        }
    };

    const canEnroll = useMemo(() => {
    if (!user) {
        return true;
    }
    if (user.role !== 'Player') {
        return false;
    }
    if (!currentUserEnrollment || currentUserEnrollment.status === 'expired') {
        return true;
    }
    return false;
    }, [user, currentUserEnrollment]);

    const isManagingCoachForThisClub = useMemo(() => user?.role === "Coach" && user.isApproved && club && user.managedClub?._id === club._id, [user, club]);
    const isAdminUser = useMemo(() => user?.role === "Admin", [user]);
    const canEditClub = useMemo(() => isAdminUser || isManagingCoachForThisClub, [isAdminUser, isManagingCoachForThisClub]);
    const showEnrollButton = useMemo(() => !authLoading && club && canEnroll, [authLoading, club, canEnroll]);
    
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    // UPDATED: This hook now generates a much more attractive and detailed message.
    const shareDetails = useMemo(() => {
        if (!club) {
            return {
                detailedBody: "Discover amazing football clubs on Goal Zone!",
                conciseTitle: "Discover amazing football clubs on Goal Zone!",
            };
        }

        const clubName = `*${club.name}*`; // Using markdown for bolding in WhatsApp/Telegram
        const coachInfo = club.coach?.name ? `👤 *Coach:* ${club.coach.name}` : '';
        
        let feesInfo = '';
        const groundFee = club.groundFees?.amount;
        const coachingFee = club.coachingFees?.amount;
        const totalFee = (groundFee || 0) + (coachingFee || 0);

        if (totalFee > 0) {
            const feeParts = [];
            if (groundFee > 0) feeParts.push(`Ground: ${groundFee.toLocaleString()}`);
            if (coachingFee > 0) feeParts.push(`Coaching: ${coachingFee.toLocaleString()}`);
            feesInfo = `💰 *Fees:* ${totalFee.toLocaleString()} ${currency} (${feeParts.join(' + ')})`;
        } else {
            feesInfo = `💰 *Fees:* Free to join!`;
        }

        const locationInfo = club.location ? `📍 *Location:* ${club?.address?.street}, ${club?.address?.city}, ${club?.address?.state}, ${club?.address?.country} - ${club?.address?.postalCode}` : 'Not Provided';

        const qrCodeCta = club.qrCodeUrl ? 'Check out their page to scan the club\'s QR Code for quick access!' : '';

        // The main message body for platforms like WhatsApp, Telegram, and as a quote for Facebook.
        // Emojis and newlines make it much more readable and engaging.
        const detailedBody = [
            `Hey! 👋 Check out this awesome football club I found on Footballkhelo.in:`,
            '',
            `⚽ ${clubName}`,
            coachInfo,
            feesInfo,
            locationInfo,
            '',
            'Find out more details and enroll here 👇',
            '',
            qrCodeCta
        ].filter(line => line !== '').join('\n');
        
        // A shorter title for Twitter
        const conciseTitle = `Join ${club.name} on Footballkhelo.in Coached by ${club.coach?.name || 'a top coach'}. #Football #Training #Footballkhelo.in`;

        return {
            detailedBody,
            conciseTitle,
        };

    }, [club]);

    if (authLoading || (loading && !club && !error)) {
        return ( <div className="min-h-screen-minus-nav flex items-center justify-center"><LoadingSpinner text="Loading Club Details..." /></div> );
    }
    
    // ... rest of the component is unchanged ...
    if (error) {
        return ( <div className="p-4 sm:p-6 lg:p-8"><ErrorStateDisplay message={error} onRetry={fetchPageData}/></div> );
    }

    if (!club) {
        return ( <div className="p-4 sm:p-6 lg:p-8"><NotFoundDisplay itemType="Club" /></div> );
    }

    const currentHeroImageSrc = carouselItems.length > 0 ? carouselItems[currentCarouselImageIndex] : club.logoUrl || `https://placehold.co/1200x500/E2E8F0/475569.png?text=${encodeURIComponent(club.name)}`;
    const enrollButtonText = currentUserEnrollment && currentUserEnrollment.status === 'expired' ? 'Renew Enrollment' : 'Enroll in Club';

    return (
        <div className={`flex flex-col ${isManagingCoachForThisClub ? "md:flex-row" : ""} min-h-screen-minus-nav bg-slate-100`}>
            {isManagingCoachForThisClub && (
                <aside className="w-full md:w-60 lg:w-64 xl:w-72 bg-white md:bg-slate-50 border-r border-slate-200 md:min-h-screen-minus-nav shadow-sm print:hidden flex-shrink-0">
                    <ClubPageSidebar clubId={club._id} />
                </aside>
            )}
            
            <main className={`w-full overflow-y-auto ${isManagingCoachForThisClub ? "md:flex-grow" : ""}`}>
                <section className="relative bg-slate-800 text-white group">
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
                        <img src={currentHeroImageSrc} alt={`${club.name || 'Club'} Highlight`} className="w-full h-full object-cover"/>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch min-h-[45vh] sm:min-h-[50vh] md:min-h-[55vh] p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col justify-between md:w-2/3 lg:w-3/4 mb-6 md:mb-0 md:pr-6">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                {club.logoUrl && <img src={club.logoUrl} alt={`${club.name} Logo`} className="w-32 h-32 sm:w-32 sm:h-32 md:w-56 md:h-56 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm p-1.5 border-2 border-white/40 shadow-lg"/>}
                                <div><h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">{club.name}</h1></div>
                            </div>
                             <div className="absolute bottom-6 left-6 md:relative md:bottom-auto md:left-auto md:mt-4">
                                 {club.coach?.name && (
                                     <p className="text-base text-slate-200 font-medium [text-shadow:_0_1px_3px_rgb(0_0_0_/_50%)]">
                                         Coached by: <span className="font-semibold text-white tracking-wide">{club.coach.name}</span>
                                     </p>
                                 )}
                             </div>
                        </div>
                        {club.qrCodeUrl && (
                            <div className="flex-shrink-0 md:w-auto flex flex-col items-center justify-center -mr-60 md:mr-0">
                                <div className="bg-white p-2.5 rounded-lg shadow-xl w-24 h-24 md:w-44 md:h-44">
                                    <a href={club.clubProfileUrl || '#'} target="_blank" rel="noopener noreferrer">
                                        <img src={club.qrCodeUrl} alt={`${club.name} QR Code`} className="w-full h-full object-contain" />
                                    </a>
                                </div>
                                <p className="text-xs text-slate-100/90 mt-1.5 font-medium">Scan to visit</p>
                            </div>
                        )}
                    </div>
                </section>
                <div className={`p-4 sm:p-6 lg:p-8 ${!isManagingCoachForThisClub && "max-w-5xl lg:max-w-6xl mx-auto"}`}>
                    <section className="mb-8 bg-white p-6 md:p-8 rounded-xl shadow-lg border">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex-grow space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-3">About {club.name}</h2>
                                    <div className="prose prose-slate max-w-none"><p>{club.description || "No description available."}</p></div>
                                </div>
                                {club.address && (
                                    <div>
                                        <h3 className="text-md font-semibold text-slate-700 mb-1.5 flex items-center"><LocationPinIcon /> Location</h3>
                                        <address className="text-slate-600 not-italic">{club.address.street}, {club.address.city}, {club.address.state}, {club.address.country} - {club.address.postalCode}</address>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 lg:w-72 w-full space-y-6">
                                {(club.groundFees?.amount > 0 || club.coachingFees?.amount > 0) && (
                                    <div>
                                        <h3 className="text-md font-semibold text-slate-700 mb-1.5 flex items-center"><CashIcon /> Fees</h3>
                                        {club.groundFees?.amount > 0 && <p className="text-sm text-slate-600">Ground: <span className="font-medium">{club.groundFees.amount.toLocaleString()} {currency}</span></p>}
                                        {club.coachingFees?.amount > 0 && <p className="text-sm text-slate-600">Coaching: <span className="font-medium">{club.coachingFees.amount.toLocaleString()} {currency}</span></p>}
                                    </div>
                                )}
                                {(club.socialMedia?.instagramUrl || club.socialMedia?.youtubeUrl) && (
                                    <div>
                                        <h3 className="text-md font-semibold text-slate-700 mb-2">Follow Us</h3>
                                        <div className="space-y-1.5">
                                            {club.socialMedia.instagramUrl && <a href={club.socialMedia.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline flex items-center"><InstagramIcon /> Instagram</a>}
                                            {club.socialMedia.youtubeUrl && <a href={club.socialMedia.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline flex items-center"><YouTubeIcon /> YouTube</a>}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center"><ShareIcon /> Share Club</h3>
                                    <div className="flex items-center space-x-2">
                                        <WhatsappShareButton url={shareUrl} title={shareDetails.detailedBody} separator={'\n\n'}>
                                            <WhatsappIcon size={36} round />
                                        </WhatsappShareButton>
                                        <FacebookShareButton url={shareUrl} quote={shareDetails.detailedBody}>
                                            <FacebookIcon size={36} round />
                                        </FacebookShareButton>
                                        <TwitterShareButton url={shareUrl} title={shareDetails.conciseTitle}>
                                            <TwitterIcon size={36} round />
                                        </TwitterShareButton>
                                        <TelegramShareButton url={shareUrl} title={shareDetails.detailedBody}>
                                            <TelegramIcon size={36} round />
                                        </TelegramShareButton>
                                    </div>
                                </div>
                                {showEnrollButton && (
                                    <button onClick={handleOpenEnrollFlow} className="w-full py-3 px-4 text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-md">
                                        {enrollButtonText}
                                    </button>
                                )}
                                {currentUserEnrollment && (
                                    <>
                                        {currentUserEnrollment.status === 'active' && (
                                            <div className="p-3 bg-green-100 text-green-800 border-green-200 rounded-lg text-center shadow-sm">
                                                <p className="font-semibold">✓ You are enrolled</p>
                                                <p className="text-xs mt-1">Active until {new Date(currentUserEnrollment.endDate).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        {currentUserEnrollment.status === 'pending' && currentUserEnrollment.method === 'offline' && (
                                            <div className="p-3 bg-amber-100 text-amber-800 border-amber-200 rounded-lg text-center shadow-sm">
                                                <p className="font-semibold">⏳ Offline Request Sent</p>
                                                <p className="text-xs mt-1">Please pay the coach in cash to activate.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                    
                    <Leaderboard
                        clubName={club.name}
                        players={club.players}
                        user={user}
                        loading={loading}
                        isAdminOrCoach={isAdminUser || isManagingCoachForThisClub}
                        isManagingCoachForThisClub={isManagingCoachForThisClub}
                    />
                </div>
            </main>

            {canEditClub && club && <EditClubModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} club={club} onClubUpdated={handleClubUpdated}/>}
            
            <PayAndEnrollModal 
                isOpen={isPayModalOpen} 
                onClose={() => setProcessingEnrollment(false) || setIsPayModalOpen(false)}
                club={club}
                platformFee={platformFee}
                onConfirmEnrollment={handleConfirmOnlinePayment} 
                processingEnrollment={processingEnrollment} 
            />

            <ChoosePaymentMethodModal
                isOpen={isChooseMethodModalOpen}
                onClose={() => setIsChooseMethodModalOpen(false)}
                onOnline={handleOnlinePayment}
                onOffline={handleRequestOffline}
                processing={processingEnrollment}
            />
        </div>
    );
};

export default ClubDetailPage;