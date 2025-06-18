import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

const ProfileIconChar = "👤";
const PaymentSettingsIconChar = "💰";
const PaymentsDashboardIconChar = "📊"; // New Icon
const PendingIconChar = "⏳";
const MyClubDashboardIconChar = "🏠";
const ManagePlayersIconChar = "👥";
const SendNotificationsIconChar = "🔔";
const ClubSettingsIconChar = "⚙️";
const ViewingClubIconChar = "👁️";
const BrowseClubsIconChar = "🔍";
const GeneralCoachDashboardIconChar = "📋";

const HamburgerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const SidebarIcon = ({ char, isActive }) => ( 
  <span 
    className={`
      w-6 h-6 mr-3 flex items-center justify-center text-xl
      transition-colors duration-150
      ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'} 
    `} 
    aria-hidden="true"
  >
    {char}
  </span>
);

const needsExactMatch = (item, coachManagedClubId) => {
  const exactPaths = [
    '/coach/profile',
    '/coach/payment-settings',
    '/coach/payments',
    '/clubs',
    '/coach/dashboard',
    `/club/${coachManagedClubId}/dashboard`
  ];
  return exactPaths.includes(item.path) || (item.id && item.id.startsWith('viewing-club-'));
};

const isLinkEffectivelyActive = (item, location, coachManagedClubId, isNaturallyActive) => {
  if (isNaturallyActive) return true;
  if (!coachManagedClubId) return false;

  const parentPaths = [
    `/coach/club/${coachManagedClubId}/manage-players`,
    `/coach/club/${coachManagedClubId}/send-notifications`,
    `/coach/club/${coachManagedClubId}/settings`
  ];

  return parentPaths.some(parentPath => 
    item.path === parentPath && location.pathname.startsWith(parentPath)
  );
};

const ClubPageSidebar = ({ clubId: clubIdInViewContext }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation(); 

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== 'Coach') {
    return null; 
  }

  const isApprovedCoach = user.isApproved;
  const coachManagedClubId = user.managedClub?._id; 

  const allMenuItems = [
    { name: 'My Profile', path: '/coach/profile', iconChar: ProfileIconChar, id: 'coach-profile', show: true },
    { name: 'Payment Settings', path: '/coach/payment-settings', iconChar: PaymentSettingsIconChar, id: 'payment-settings', show: true },
    { name: 'Payments Dashboard', path: '/coach/payments', iconChar: PaymentsDashboardIconChar, id: 'payments-dashboard', show: isApprovedCoach && coachManagedClubId },
    { name: 'Approval Pending', path: '#!', iconChar: PendingIconChar, id: 'pending-approval', nonClickable: true, show: !isApprovedCoach },
    { name: 'My Club Dashboard', path: `/club/${coachManagedClubId}/dashboard`, iconChar: MyClubDashboardIconChar, id: 'my-club-dashboard', show: isApprovedCoach && coachManagedClubId },
    { name: 'Manage Players', path: `/coach/club/${coachManagedClubId}/manage-players`, iconChar: ManagePlayersIconChar, id: 'manage-players', show: isApprovedCoach && coachManagedClubId },
    { name: 'Send Club Notifications', path: `/coach/club/${coachManagedClubId}/send-notifications`, iconChar: SendNotificationsIconChar, id: 'send-club-notifications', show: isApprovedCoach && coachManagedClubId },
    { name: 'My Club Settings', path: `/coach/club/${coachManagedClubId}/settings`, iconChar: ClubSettingsIconChar, id: 'my-club-settings', show: isApprovedCoach && coachManagedClubId },
    { name: 'Coach Dashboard', path: '/coach/dashboard', iconChar: GeneralCoachDashboardIconChar, id: 'general-coach-dashboard', show: isApprovedCoach && !coachManagedClubId },
    { name: 'Viewing Other Club', path: `/club/${clubIdInViewContext}`, iconChar: ViewingClubIconChar, id: `viewing-club-${clubIdInViewContext}`, show: clubIdInViewContext && clubIdInViewContext !== coachManagedClubId },
    { name: 'Browse All Clubs', path: `/clubs`, iconChar: BrowseClubsIconChar, id: 'browse-clubs', show: true },
  ];

  const visibleMenuItems = allMenuItems.filter(item => item.show);

  const navLinkBaseStyles = "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100";
  const activeNavLinkStyles = "bg-sky-600 text-white shadow-sm";
  const inactiveNavLinkStyles = "text-slate-600 hover:bg-slate-200 hover:text-sky-700";

  return (
    <>
      <button
        className="sm:hidden fixed top-0 left-0 z-[70] h-16 w-16 flex items-center justify-center text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open coach menu"
      >
        <HamburgerIcon />
      </button>

      {isMobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-[80]"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div 
        className={`
          flex flex-col h-full print:hidden
          bg-slate-50 text-slate-700 border-r border-slate-200
          
          fixed top-0 left-0 w-72 p-4 shadow-xl z-[90]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}

          sm:relative sm:w-full sm:p-4 sm:shadow-sm sm:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-2 mb-4 pt-2">
            <div>
              <h3 className="text-lg font-semibold text-sky-700 select-none tracking-wide">
                Coach Menu
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {isApprovedCoach 
                  ? (coachManagedClubId ? `Managing Club` : "Approved") 
                  : "Pending Approval"}
              </p>
            </div>
            <button
              className="sm:hidden text-slate-500 hover:text-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
        </div>

        <nav className="flex-grow space-y-1.5 overflow-y-auto pr-1 -mr-2">
          {visibleMenuItems.map((item) => {
            if (item.nonClickable) {
              return (
                <div
                  key={item.id}
                  className={`${navLinkBaseStyles} text-slate-400 cursor-not-allowed opacity-70`}
                >
                  <SidebarIcon char={item.iconChar} isActive={false} /> 
                  <span>{item.name}</span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={needsExactMatch(item, coachManagedClubId)}
              >
                {({ isActive: isNaturallyActive }) => {
                  const isActive = isLinkEffectivelyActive(item, location, coachManagedClubId, isNaturallyActive);
                  return (
                    <div className={`${navLinkBaseStyles} ${isActive ? activeNavLinkStyles : inactiveNavLinkStyles}`}>
                      <SidebarIcon char={item.iconChar} isActive={isActive} /> 
                      <span className="truncate">{item.name}</span>
                    </div>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default ClubPageSidebar;