import React from 'react';
import { NavLink } from 'react-router-dom';

// --- Icons (Placeholders) ---
// You can replace these with actual SVG icons from a library like Heroicons or FontAwesome.
const DashboardIcon = ({ className = "w-5 h-5" }) => <span className={className}>📊</span>;
const UsersIcon = ({ className = "w-5 h-5" }) => <span className={className}>👥</span>;
const ClubsIcon = ({ className = "w-5 h-5" }) => <span className={className}>🏟️</span>;
const BellIcon = ({ className = "w-5 h-5" }) => <span className={className}>🔔</span>;
const ReelsIcon = ({ className = "w-5 h-5" }) => <span className={className}>📹</span>;
const TrophyIcon = ({ className = "w-5 h-5" }) => <span className={className}>🏆</span>;
const ProfileIcon = ({ className = "w-5 h-5" }) => <span className={className}>👤</span>;
const SettingsIcon = ({ className = "w-5 h-5" }) => <span className={className}>⚙️</span>; // <-- NEW ICON

const AdminSidebar = () => {
  const linkBaseClass = "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100";
  const iconWrapperClass = "w-6 h-6 mr-3 flex items-center justify-center text-lg";
  const activeIconClass = "text-white";

  // --- Menu Items Array ---
  // The new "Platform Settings" link is added here.
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon />, exact: true },
    { name: 'My Profile', path: '/admin/profile', icon: <ProfileIcon /> },
    { name: 'Manage Players', path: '/admin/manage-players', icon: <UsersIcon /> },
    { name: 'Manage Clubs & Coaches', path: '/admin/manage-clubs', icon: <ClubsIcon /> },
    { name: 'Platform Settings', path: '/admin/settings', icon: <SettingsIcon /> },
    { name: 'Send Notifications', path: '/admin/send-notifications', icon: <BellIcon /> },
    { name: 'View Feedbacks', path: '/admin/feedbacks', icon: <UsersIcon /> }, 
    { name: 'Manage Reels', path: '/admin/manage-reels', icon: <ReelsIcon /> },
    { name: 'Manage Tournaments', path: '/admin/manage-tournaments', icon: <TrophyIcon /> },
  ];

  return (
    <aside className="w-full bg-slate-100 text-slate-700 p-3 sm:p-4 h-full flex flex-col border-r border-slate-300 shadow-sm">
      <div className="mb-6 pt-2">
        <h3 className="text-lg font-semibold text-sky-700 select-none tracking-wide px-2">Admin Panel</h3>
      </div>
      <nav className="flex-grow space-y-1.5 overflow-y-auto pr-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
                `${linkBaseClass} ${isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200 hover:text-sky-700'}`
            }
          >
            {({isActive}) => (
                 <span className={`${iconWrapperClass} ${isActive ? activeIconClass : 'text-slate-500'}`}>
                    {/* This clones the icon and injects the correct dynamic classes */}
                    {React.cloneElement(item.icon, { className: `w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-600 transition-colors'}` })}
                </span>
            )}
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      {/* Optional: Add a logout button or other links here */}
    </aside>
  );
};

export default AdminSidebar;