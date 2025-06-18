// client/src/components/layout/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.js';
const AdminLayout = () => {

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen-minus-nav"> 
      <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 print:hidden bg-slate-100 border-r border-slate-300 shadow-sm">
        <AdminSidebar />
      </aside>
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;