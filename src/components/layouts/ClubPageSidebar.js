// client/src/components/layout/ClubPageSidebar.js
import React from 'react';
import { NavLink, useLocation as useRouterLocationHook } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../../contexts/AuthContext.js';

const Icon = ({ char, color = "text-indigo-300" }) => <span className={`w-6 h-6 mr-3 flex items-center justify-center ${color} group-hover:text-white transition-colors`} aria-hidden="true">{char}</span>;

const ClubPageSidebar = ({ clubId, clubManagerId }) => {
  const { user } = useAuth();
  const location = useRouterLocationHook(); // <<< FIX: Use the hook

  if (!user && !clubId) {
    return null;
  }

  let menuItems = [];
  const isGuest = !user; // Though guests won't see this if outer component checks `!!user`
  const role = user?.role;
  const userId = user?._id;
  const isApprovedCoach = role === 'Coach' && user?.isApproved;
  const isManagingThisClub = isApprovedCoach && clubId && user?.managedClub?._id === clubId;

  // --- Define Base Menu Items ---
  const basePublicItems = [
    { name: 'Club Home', path: `/club/${clubId}`, icon: () => <Icon char="🏠" />, exact: true },
    { name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" /> },
  ];

  const playerItems = [
    { name: 'My Dashboard', path: '/player/dashboard', icon: () => <Icon char="📊" /> },
    { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> },
    { name: 'My Club Payments', path: `/player/club/${clubId}/payments`, icon: () => <Icon char="💳" />, clubSpecific: true },
    { name: 'My Club History', path: `/player/club/${clubId}/history`, icon: () => <Icon char="📜" />, clubSpecific: true },
  ];

  const managingCoachItems = [
    { name: 'Club Overview', path: `/club/${clubId}`, icon: () => <Icon char="🏠" />, exact: true },
    { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> },
    { name: 'Manage Players', path: `/coach/dashboard/club/${clubId}/players`, icon: () => <Icon char="👥" /> },
    { name: 'Club Settings', path: `/club/${clubId}/settings`, icon: () => <Icon char="⚙️" /> },
    { name: 'View Enrollments', path: `/coach/dashboard/club/${clubId}/enrollments`, icon: () => <Icon char="📈" /> },
    { name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" /> },
  ];
  
  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: () => <Icon char="🛡️" /> },
    { name: 'Viewing Club:', path: `/club/${clubId}`, icon: () => <Icon char="👁️" />, exact: true, isCurrentClub: true },
    { name: 'Edit This Club (Admin)', path: `/admin/clubs/${clubId}/edit`, icon: () => <Icon char="✏️" /> },
    { name: 'Manage All Users', path: '/admin/manage-users', icon: () => <Icon char="👥" /> },
    { name: 'Manage All Clubs', path: '/admin/manage-clubs', icon: () => <Icon char="🏟️" /> },
    { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> },
  ];

  // --- Determine Menu Based on Role ---
  if (isGuest && clubId) { // Only show very basic if guest AND on a club page
    menuItems = basePublicItems.filter(item => item.clubSpecific !== false || clubId);
  } else if (role === 'Player') {
    menuItems = [...playerItems.filter(item => !item.clubSpecific || clubId)];
    if (clubId) menuItems.unshift({ name: 'Club Home', path: `/club/${clubId}`, icon: () => <Icon char="🏠" />, exact: true });
    menuItems.push({ name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" /> });
  } else if (role === 'Coach') {
    if (isManagingThisClub && clubId) {
        menuItems = [...managingCoachItems];
    } else { 
        menuItems.push({ name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> });
        if (user.managedClub?._id) {
             menuItems.push({ name: 'Go To My Club', path: `/club/${user.managedClub._id}`, icon: () => <Icon char="🛠️" />});
        } else {
            menuItems.push({ name: 'Coach Area', path: '/coach/dashboard', icon: () => <Icon char="📋" /> });
        }
        if (clubId) menuItems.unshift({ name: 'Viewing Club', path: `/club/${clubId}`, icon: () => <Icon char="🏠" />, exact: true });
        menuItems.push({ name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" /> });
    }
  } else if (role === 'Admin') {
    if (clubId) menuItems = [...adminItems];
    else { // Admin on a non-club page
        menuItems = [
            { name: 'Admin Dashboard', path: '/admin/dashboard', icon: () => <Icon char="🛡️" />, exact: true },
            { name: 'Manage Users', path: '/admin/manage-users', icon: () => <Icon char="👥" />},
            { name: 'Manage Clubs', path: '/admin/manage-clubs', icon: () => <Icon char="🏟️" />},
            { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> },
            { name: 'Browse Clubs', path: `/`, icon: () => <Icon char="🔍" />}
        ];
    }
  }
  
  const uniqueMenuItemsByPath = menuItems.reduce((acc, current) => {
    if (current && current.path && !acc.find(item => item.path === current.path)) {
      return acc.concat([current]);
    }
    return acc;
  }, []);


  if (uniqueMenuItemsByPath.length === 0 && !isGuest) { // If no items, but user is logged in, show a basic profile link
      if (user?.role) { // Check if user and role exist
        uniqueMenuItemsByPath.push({ name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> });
        if(user.role !== 'Admin') uniqueMenuItemsByPath.push({ name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" /> });
      } else {
          return null; // Truly no user to show a profile link for
      }
  }
  if (uniqueMenuItemsByPath.length === 0 && isGuest) return null;


  return (
    <div className="w-full bg-gray-800 text-gray-100 p-4 space-y-1 h-full print:hidden">
      <div className="px-2 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-indigo-300 select-none">Navigation</h3>
        {user && <p className="text-xs text-gray-400">Role: {user.role}</p>}
      </div>
      <nav className="space-y-1">
        {uniqueMenuItemsByPath.map((item) => (
          <NavLink
            key={item.name + item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 group focus:outline-none focus:ring-2 focus:ring-indigo-400
               ${isActive || (item.isCurrentClub && location.pathname === item.path) // <<< FIX: Use 'location' from hook
                 ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-800'
                 : 'text-gray-300 hover:bg-gray-700 hover:text-white'
               }`
            }
          >
            <item.icon />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ClubPageSidebar;