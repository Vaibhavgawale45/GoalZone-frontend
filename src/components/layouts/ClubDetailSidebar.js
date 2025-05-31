// client/src/components/layout/ClubPageSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom'; // Using NavLink for active styling
import { useAuth } from '../../contexts/AuthContext.js';

// Placeholder Icons - Replace with a real icon library like react-icons
const Icon = ({ char, color = "text-indigo-300" }) => <span className={`w-6 h-6 mr-3 flex items-center justify-center ${color} group-hover:text-white transition-colors`} aria-hidden="true">{char}</span>;

const ClubPageSidebar = ({ clubId, clubManagerId }) => {
  const { user } = useAuth();

  if (!user && !clubId) { // If no user and not even on a club page, don't show sidebar
    return null;
  }

  let menuItems = [];
  const isGuest = !user;
  const role = user?.role;
  const userId = user?._id;
  const isApprovedCoach = role === 'Coach' && user?.isApproved;
  const isManagingThisClub = isApprovedCoach && clubManagerId === userId;

  // --- Define Base Menu Items ---
  const basePublicItems = [
    { name: 'Club Home', path: `/club/${clubId}`, icon: () => <Icon char="🏠" />, exact: true, roles: ['Guest', 'Player', 'Coach', 'Admin'] },
    { name: 'Browse All Clubs', path: `/`, icon: () => <Icon char="🔍" />, roles: ['Guest', 'Player', 'Coach', 'Admin'] },
  ];

  const playerItems = [
    { name: 'My Dashboard', path: '/player/dashboard', icon: () => <Icon char="📊" />, roles: ['Player'] },
    { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" />, roles: ['Player','Coach'] }, // Coaches also have profiles
    { name: 'My Club Payments', path: `/player/payments/club/${clubId}`, icon: () => <Icon char="💳" />, roles: ['Player'], clubSpecific: true },
    { name: 'My Club History', path: `/player/history/club/${clubId}`, icon: () => <Icon char="📜" />, roles: ['Player'], clubSpecific: true },
    // { name: 'Club Chats', path: `/club/${clubId}/chat`, icon: () => <Icon char="💬" />, roles: ['Player'], clubSpecific: true },
  ];

  const managingCoachItems = [
    { name: 'Coach Dashboard', path: '/coach/dashboard', icon: () => <Icon char="🛠️" />, roles: ['Coach'], condition: () => isManagingThisClub },
    { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" />, roles: ['Coach'] },
    { name: 'Manage Players', path: `/coach/dashboard`, /* Link to section in coach dashboard or specific page */ icon: () => <Icon char="👥" />, roles: ['Coach'], condition: () => isManagingThisClub },
    { name: 'Club Settings', path: `/club/${clubId}/settings`, /* or link to edit modal on ClubDetailPage */ icon: () => <Icon char="⚙️" />, roles: ['Coach'], condition: () => isManagingThisClub },
    { name: 'View Enrollments', path: `/coach/dashboard`, /* Link to section in coach dashboard */ icon: () => <Icon char="📈" />, roles: ['Coach'], condition: () => isManagingThisClub },
    // { name: 'Club Chats', path: `/club/${clubId}/chat`, icon: () => <Icon char="💬" />, roles: ['Coach'], clubSpecific: true, condition: () => isManagingThisClub },
  ];
  
  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: () => <Icon char="🛡️" /> , roles: ['Admin']},
    { name: 'Club Details (Admin View)', path: `/club/${clubId}`, icon: () => <Icon char="👁️" />, exact: true, roles: ['Admin'], clubSpecific: true },
    { name: 'Edit This Club', path: `/admin/clubs/${clubId}/edit`, icon: () => <Icon char="⚙️" />, roles: ['Admin'], clubSpecific: true }, // Placeholder page
    { name: 'Manage All Users', path: '/admin/manage-users', icon: () => <Icon char="👥" />, roles: ['Admin'] },
    { name: 'Manage All Clubs', path: '/admin/manage-clubs', icon: () => <Icon char="🏟️" />, roles: ['Admin'] },
  ];

  // --- Determine Menu Based on Role ---
  if (isGuest) { // Only show basic club navigation for guests on a club page
    menuItems = basePublicItems.filter(item => item.clubSpecific !== false || clubId); // Show general browse even if no clubId
  } else if (role === 'Player') {
    menuItems = [...basePublicItems, ...playerItems.filter(item => !item.clubSpecific || clubId)];
  } else if (role === 'Coach') {
    if (isManagingThisClub) {
        menuItems = [...managingCoachItems.filter(item => !item.clubSpecific || clubId)];
    } else { // Coach viewing a club they don't manage - player-like view
        menuItems = [...basePublicItems.filter(item => !item.clubSpecific || clubId), { name: 'My Profile', path: '/profile', icon: () => <Icon char="👤" /> }];
        // Optionally add a link to their own dashboard if they have one
        if (user.managedClub) {
             menuItems.push({ name: 'My Coach Dashboard', path: '/coach/dashboard', icon: () => <Icon char="🛠️" />});
        }
    }
  } else if (role === 'Admin') {
    menuItems = [...adminItems.filter(item => !item.clubSpecific || clubId)];
  }


  // Filter out items that have a condition and the condition is false
  menuItems = menuItems.filter(item => item.condition ? item.condition() : true);
  
  // Remove duplicates by path (keeps the first occurrence, relevant if mixing lists)
  const uniqueMenuItems = menuItems.filter((item, index, self) =>
    index === self.findIndex((t) => (t.path === item.path && t.name === item.name))
  );

  if (uniqueMenuItems.length === 0) return null; // Still no relevant items

  return (
    <div className="w-full bg-gray-800 text-gray-100 p-4 space-y-1 h-full print:hidden">
      <div className="px-2 mb-4">
        <h3 className="text-xl font-semibold text-indigo-300 select-none">Navigation</h3>
        {user && <p className="text-xs text-gray-400">Role: {user.role}</p>}
      </div>
      <nav>
        {uniqueMenuItems.map((item) => (
          <NavLink
            key={item.name + item.path} // More unique key
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 group focus:outline-none focus:ring-2 focus:ring-indigo-400
               ${isActive
                 ? 'bg-indigo-600 text-white shadow-lg'
                 : 'text-gray-300 hover:bg-gray-700 hover:text-white'
               }`
            }
          >
            <item.icon /> {/* Icon component called */}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ClubPageSidebar;