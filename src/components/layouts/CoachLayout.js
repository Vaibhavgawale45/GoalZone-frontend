import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ClubPageSidebar from "./ClubPageSidebar"; // Adjust the import path as necessary
import { useAuth } from '../../contexts/AuthContext.js'; // Import useAuth

const CoachLayout = () => {
    const location = useLocation();
    const { user } = useAuth(); // Get the user

    // Find the club ID from various URL patterns
    const getClubIdFromPath = (pathname) => {
        const clubMatch = pathname.match(/^\/club\/([a-zA-Z0-9]+)/);
        if (clubMatch) return clubMatch[1];
        
        const coachClubMatch = pathname.match(/^\/coach\/club\/([a-zA-Z0-9]+)/);
        if (coachClubMatch) return coachClubMatch[1];
        
        return null;
    };

    const clubIdFromPath = getClubIdFromPath(location.pathname);
    const isCoach = user && user.role === 'Coach';

    return (
        // The layout is a flex container
        <div className="flex h-screen bg-slate-100">
            {/* 
              This container holds the sidebar. 
              It only takes up space on desktop IF the user is a coach.
              Otherwise, it collapses, leaving the main content to fill the screen.
            */}
            <div className={`${isCoach ? 'sm:w-64' : 'w-0'} flex-shrink-0 transition-all duration-300`}>
                <ClubPageSidebar clubIdInViewContext={clubIdFromPath} /> 
            </div>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto">
                {/* 
                  This padding is important! It prevents content from hiding
                  behind your main Navbar component (which is not part of this layout).
                  It needs to match the height of your sticky Navbar.
                */}
                <div className="pt-20 p-4 sm:p-6 lg:p-8">
                    <Outlet /> {/* Renders the page (e.g., ClubsPage, CoachProfilePage) */}
                </div>
            </main>
        </div>
    );
};

export default CoachLayout;