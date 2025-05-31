// client/src/components/layout/CoachSidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Icons (example, replace with actual icons from a library like react-icons)
const DashboardIcon = () => <span>📊</span>;
const ProfileIcon = () => <span>👤</span>;
// Add more icons as needed

const CoachSidebar = ({ setActiveView }) => {
  const location = useLocation(); // To highlight active link based on a convention or state

  // For this simple sidebar, we'll use setActiveView.
  // A more complex app might use query params or nested routes for sidebar views.

  const menuItems = [
    { name: 'Club Dashboard', view: 'dashboardOverview', icon: <DashboardIcon />, pathSegment: 'dashboard' },
    { name: 'My Profile', view: 'profileManagement', icon: <ProfileIcon />, pathSegment: 'profile' },
    // Add more items like "Manage Players", "Finances", "Settings" etc.
  ];

  // A simple way to determine active link (can be improved)
  // For now, we rely purely on setActiveView.
  // const isActive = (pathSegment) => location.pathname.includes(`/coach/${pathSegment}`);


  return (
    <div className="w-full h-full bg-gray-800 text-white p-5 space-y-3 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-100 mb-5 px-2">Coach Menu</h2>
      <nav className="flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.view)}
            // For actual navigation if these were routes:
            // as={Link} to={`/coach/${item.pathSegment}`}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
                        hover:bg-gray-700 hover:text-white focus:outline-none focus:bg-gray-700
                        ${'' /* Add active class based on current view here if needed */}
                      `}
          >
            <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} ClubFinder</p>
      </div>
    </div>
  );
};

export default CoachSidebar;