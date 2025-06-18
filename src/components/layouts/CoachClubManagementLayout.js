// client/src/components/layout/CoachClubManagementLayout.js (NEW or adapt existing)
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ClubPageSidebar from './ClubPageSidebar'; // Your coach-specific sidebar
// You might also want a header or other common elements here

const CoachClubManagementLayout = () => {
    const { clubId } = useParams(); // Get the clubId from the URL

    // Here you might fetch specific club details if needed for the layout header
    // Or verify that the logged-in coach actually manages this clubId

    return (
        <div className="flex min-h-screen-minus-nav"> {/* Adjust for your main navbar height */}
            <aside className="w-64 bg-slate-100 border-r border-slate-300 flex-shrink-0 print:hidden">
                {/* Pass the clubId to the sidebar so it knows which club's links to generate */}
                <ClubPageSidebar clubId={clubId} />
            </aside>
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
                <Outlet /> {/* This is where nested route components will render */}
            </main>
        </div>
    );
};
export default CoachClubManagementLayout;