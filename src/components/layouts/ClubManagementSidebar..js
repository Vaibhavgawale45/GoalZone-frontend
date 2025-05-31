// client/src/components/layout/ClubManagementSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const ClubManagementSidebar = ({ clubId, userRole }) => {
  // This sidebar is now simpler: its presence indicates you *are* on a management-enabled view
  // of the club detail page. Links can go to other distinct management areas.

  const coachMenuItems = [
    { name: 'Current Club View', path: `/club/${clubId}`, icon: '📊' }, // Link to itself, or just text
    { name: 'My Coach Profile', path: '/coach/profile', icon: '👤' }, // Separate page for profile
    // If you want "Manage Players" for THIS club to be a different *page*, link to it:
    // { name: 'Manage Club Players', path: `/coach/club/${clubId}/manage-players`, icon: '👥' },
    // Otherwise, player management tools might be directly on ClubDetailPage for the coach.
  ];

  const adminMenuItems = [
    { name: 'Current Club View', path: `/club/${clubId}`, icon: '📊' },
    // { name: 'Admin Club Settings', path: `/admin/club/${clubId}/settings`, icon: '⚙️'},
    { name: 'Manage All Users', path: '/admin/manage-users', icon: '🧑‍🤝‍🧑' },
    { name: 'Manage All Clubs', path: '/admin/manage-clubs', icon: '🏟️' },
  ];

  const menuItems = userRole === 'Coach' ? coachMenuItems : adminMenuItems;

  return (
    <div className="w-full h-full bg-gray-800 text-white p-5 space-y-2 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 px-2">
        {userRole === 'Coach' ? 'Coach Tools' : 'Admin Tools'}
      </h3>
      <nav className="flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 hover:bg-gray-700 hover:text-white focus:outline-none focus:bg-gray-700"
          >
            <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} ClubFinder</p>
      </div>
    </div>
  );
};
export default ClubManagementSidebar;